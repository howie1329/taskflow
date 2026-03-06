"use client"

import { useMemo, useState } from "react"
import { useChat } from "@ai-sdk/react"
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithApprovalResponses,
} from "ai"
import { Globe, FileText, Search, Sparkles, Wand2 } from "lucide-react"
import { toast } from "sonner"
import { useNotes } from "@/components/notes"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useSidebar } from "@/components/ui/sidebar"
import type { Note } from "@/components/notes/types"

type TextPart = {
  type: "text"
  text?: string
}

type ToolApproval = {
  id: string
}

type ReplaceCurrentNoteToolPart = {
  type: "tool-replaceCurrentNote"
  state:
    | "input-streaming"
    | "input-available"
    | "approval-requested"
    | "approval-responded"
    | "output-available"
    | "output-error"
  toolCallId: string
  input?: {
    title?: string
    content?: string
  }
  output?: {
    ok?: boolean
    noteId?: string
    updatedAt?: number
    reason?: string
    message?: string
  }
  errorText?: string
  approval?: ToolApproval
}

type SearchWebForNoteContextToolPart = {
  type: "tool-searchWebForNoteContext"
  state:
    | "input-streaming"
    | "input-available"
    | "approval-requested"
    | "approval-responded"
    | "output-available"
    | "output-error"
  toolCallId: string
  input?: {
    query?: string
    reason?: string
  }
  output?: {
    query?: string
    reason?: string
    provider?: string
    message?: string
    results?: Array<{
      title?: string
      url?: string
      snippet?: string
    }>
  }
  errorText?: string
  approval?: ToolApproval
}

type MessagePart =
  | TextPart
  | ReplaceCurrentNoteToolPart
  | SearchWebForNoteContextToolPart
  | { type: string }

const promptSuggestions = [
  "Summarize this note",
  "Turn this into cleaner meeting notes",
  "Extract action items",
  "Find unclear sections",
  "Research this topic and update the note",
]

function formatTimestamp(value?: number) {
  if (!value) return "Unknown time"

  try {
    return new Date(value).toLocaleString()
  } catch {
    return "Unknown time"
  }
}

function getTextFromParts(parts: MessagePart[]) {
  return parts
    .filter((part): part is TextPart => part.type === "text")
    .map((part) => part.text ?? "")
    .join("")
    .trim()
}

function excerpt(text: string, maxLength = 220) {
  const normalized = text.replace(/\s+/g, " ").trim()
  if (!normalized) return ""
  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, maxLength).trim()}...`
}

function summarizeDiff(currentText: string, nextText: string) {
  const summaries: string[] = []
  const currentLength = currentText.trim().length
  const nextLength = nextText.trim().length
  const currentLines = currentText.split("\n")
  const nextLines = nextText.split("\n")
  const currentBullets = currentLines.filter((line) => /^\s*[-*]\s+/.test(line)).length
  const nextBullets = nextLines.filter((line) => /^\s*[-*]\s+/.test(line)).length
  const currentHeadings = currentLines.filter((line) => /^\s*#{1,6}\s+/.test(line)).length
  const nextHeadings = nextLines.filter((line) => /^\s*#{1,6}\s+/.test(line)).length

  if (currentText.trim() && nextText.trim() && currentText.trim() !== nextText.trim()) {
    summaries.push("rewrote content")
  }
  if (nextBullets > currentBullets) {
    summaries.push("added bullets")
  }
  if (nextHeadings > currentHeadings) {
    summaries.push("added headings")
  }
  if (currentLength > 0 && nextLength < currentLength * 0.8) {
    summaries.push("shortened note")
  }
  if (nextLength > currentLength * 1.2) {
    summaries.push("expanded details")
  }

  return summaries.length > 0 ? summaries.slice(0, 3) : ["updated note"]
}

function MessageBubble({
  role,
  children,
}: {
  role: "user" | "assistant"
  children: React.ReactNode
}) {
  return (
    <div
      className={[
        "rounded-xl border px-3 py-2 text-sm",
        role === "user"
          ? "border-primary/20 bg-primary/5"
          : "border-border/60 bg-background",
      ].join(" ")}
    >
      {children}
    </div>
  )
}

function ReplaceNoteToolCard({
  note,
  part,
  onApprove,
  onDeny,
}: {
  note: Note
  part: ReplaceCurrentNoteToolPart
  onApprove: (approvalId: string) => Promise<void>
  onDeny: (approvalId: string) => Promise<void>
}) {
  const proposedTitle = part.input?.title?.trim() || note.title || "Untitled note"
  const proposedContent = part.input?.content ?? ""
  const diffSummary = summarizeDiff(note.contentText, proposedContent)

  if (part.state === "approval-requested") {
    return (
      <div className="mt-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-xs">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <Wand2 className="size-3.5" />
          Apply note rewrite?
        </div>
        <p className="mt-2 text-muted-foreground">
          The assistant is ready to replace the current note with a full rewrite.
        </p>
        <div className="mt-3 space-y-2">
          <div>
            <p className="font-medium text-foreground">Proposed title</p>
            <p className="text-muted-foreground">{proposedTitle}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Change summary</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {diffSummary.map((item) => (
                <Badge key={item} variant="outline" className="h-5 text-[10px]">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="font-medium text-foreground">Content preview</p>
            <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
              {excerpt(proposedContent, 280) || "No preview available."}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Button
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => part.approval?.id && void onApprove(part.approval.id)}
            disabled={!part.approval?.id}
          >
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => part.approval?.id && void onDeny(part.approval.id)}
            disabled={!part.approval?.id}
          >
            Deny
          </Button>
        </div>
      </div>
    )
  }

  if (part.state === "approval-responded") {
    return (
      <div className="mt-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
        Saving approved note changes...
      </div>
    )
  }

  if (part.state === "output-available") {
    const success = part.output?.ok === true
    return (
      <div className="mt-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-xs">
        <p className={success ? "font-medium" : "font-medium text-destructive"}>
          {success ? "Note updated" : "Note update failed"}
        </p>
        <p className="mt-1 text-muted-foreground">
          {part.output?.message || "The note update did not return a message."}
        </p>
        {success ? (
          <p className="mt-1 text-muted-foreground">
            Saved at {formatTimestamp(part.output?.updatedAt)}
          </p>
        ) : null}
        {part.output?.reason ? (
          <p className="mt-1 text-muted-foreground">Reason: {part.output.reason}</p>
        ) : null}
      </div>
    )
  }

  if (part.state === "output-error") {
    return (
      <div className="mt-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
        {part.errorText || "The note edit tool failed."}
      </div>
    )
  }

  return (
    <div className="mt-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
      Preparing note changes...
    </div>
  )
}

function WebSearchToolCard({
  part,
}: {
  part: SearchWebForNoteContextToolPart
}) {
  if (part.state === "input-available" || part.state === "input-streaming") {
    return (
      <div className="mt-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-xs">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <Search className="size-3.5" />
          Searching the web
        </div>
        <div className="mt-3 space-y-2">
          <div>
            <p className="font-medium text-foreground">Query</p>
            <p className="text-muted-foreground">{part.input?.query || "No query provided."}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Why this is needed</p>
            <p className="text-muted-foreground">
              {part.input?.reason || "The assistant needs outside information to answer accurately."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (part.state === "approval-requested" || part.state === "approval-responded") {
    return (
      <div className="mt-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
        Running web search...
      </div>
    )
  }

  if (part.state === "output-available") {
    const results = Array.isArray(part.output?.results) ? part.output.results : []
    return (
      <div className="mt-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-xs">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium">Web search results</p>
          {part.output?.provider ? (
            <Badge variant="outline" className="h-5 text-[10px]">
              {part.output.provider}
            </Badge>
          ) : null}
        </div>
        <p className="mt-1 text-muted-foreground">
          {part.output?.message || `Results for ${part.output?.query || part.input?.query || "search"}.`}
        </p>
        <div className="mt-3 space-y-2">
          {results.length > 0 ? (
            results.map((result, index) => (
              <a
                key={`${result.url}_${index}`}
                href={result.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-md border border-border/60 bg-background px-2 py-2 transition-colors hover:bg-accent/40"
              >
                <p className="font-medium text-foreground">{result.title || result.url}</p>
                <p className="mt-1 line-clamp-2 text-muted-foreground">
                  {result.snippet || "No snippet available."}
                </p>
                <p className="mt-1 truncate text-[10px] text-muted-foreground">{result.url}</p>
              </a>
            ))
          ) : (
            <p className="text-muted-foreground">No sources returned.</p>
          )}
        </div>
      </div>
    )
  }

  if (part.state === "output-error") {
    return (
      <div className="mt-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
        {part.errorText || "The web search tool failed."}
      </div>
    )
  }

  return (
    <div className="mt-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
      Preparing web search...
    </div>
  )
}

function NotesMiniChat({ note }: { note: Note }) {
  const [input, setInput] = useState("")

  const noteContext = useMemo(
    () => ({
      noteId: note._id,
      title: note.title,
    }),
    [note._id, note.title],
  )

  const {
    messages,
    status,
    error,
    sendMessage,
    setMessages,
    addToolApprovalResponse,
  } = useChat({
    id: `note_mini_chat_${note._id}`,
    transport: new DefaultChatTransport({
      api: "/api/note-copilot",
      prepareSendMessagesRequest: ({
        id,
        messages,
        trigger,
        messageId,
        body,
        headers,
        credentials,
      }) => ({
        headers,
        credentials,
        body: {
          id,
          messages,
          trigger,
          messageId,
          ...body,
          noteContext,
        },
      }),
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
  })

  const handleApproval = async (approvalId: string, approved: boolean) => {
    try {
      await addToolApprovalResponse({
        id: approvalId,
        approved,
      })
    } catch {
      toast.error("Failed to submit approval response")
    }
  }

  const handleSubmit = async () => {
    const trimmed = input.trim()
    if (!trimmed || status === "streaming" || status === "submitted") return
    setInput("")
    await sendMessage(
      { text: trimmed },
      {
        body: {
          noteContext,
        },
      },
    )
  }

  const resetChat = () => {
    setMessages([])
    setInput("")
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium">Notes mini chat</p>
            <p className="truncate text-xs text-muted-foreground">
              {note.title || "Untitled note"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={resetChat}
          >
            Reset
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <FileText className="size-3" />
            Using current note only
          </Badge>
          <Badge variant="outline">{messages.length} messages</Badge>
          <Badge variant="outline">{status}</Badge>
        </div>
      </div>

      <Separator />

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <div className="space-y-3 rounded-xl border border-dashed border-border/70 bg-muted/20 p-3">
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Ask about this note</p>
                <p className="text-xs text-muted-foreground">
                  I can answer questions from the current note, rewrite it with approval, or search the web when you ask for outside information.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {promptSuggestions.map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setInput(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const parts = message.parts as MessagePart[]
            const text = getTextFromParts(parts)

            return (
              <MessageBubble
                key={message.id}
                role={message.role === "user" ? "user" : "assistant"}
              >
                <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  {message.role}
                </p>
                {text ? <p className="whitespace-pre-wrap">{text}</p> : null}
                {parts.map((part) => {
                  if (part.type === "tool-replaceCurrentNote") {
                    return (
                      <ReplaceNoteToolCard
                        key={part.toolCallId}
                        note={note}
                        part={part}
                        onApprove={(approvalId) => handleApproval(approvalId, true)}
                        onDeny={(approvalId) => handleApproval(approvalId, false)}
                      />
                    )
                  }

                  if (part.type === "tool-searchWebForNoteContext") {
                    return (
                      <WebSearchToolCard
                        key={part.toolCallId}
                        part={part}
                      />
                    )
                  }

                  return null
                })}
                {!text &&
                !parts.some(
                  (part) =>
                    part.type === "tool-replaceCurrentNote" ||
                    part.type === "tool-searchWebForNoteContext",
                ) ? (
                  <p className="text-xs text-muted-foreground">No renderable content.</p>
                ) : null}
              </MessageBubble>
            )
          })
        )}
        {error ? <p className="text-xs text-destructive">{error.message}</p> : null}
      </div>

      <div className="shrink-0 space-y-2 border-t border-border/40 pt-3">
        <Textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about this note..."
          className="min-h-[100px] resize-none"
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
              event.preventDefault()
              void handleSubmit()
            }
          }}
        />
        <Button
          className="w-full"
          onClick={() => void handleSubmit()}
          disabled={status === "streaming" || status === "submitted" || !input.trim()}
        >
          Send
        </Button>
      </div>
    </div>
  )
}

function NotesInspectorInfo({ note }: { note: Note }) {
  const wordCount = note.contentText.split(/\s+/).filter(Boolean).length
  const lineCount = note.contentText.split(/\n/).filter(Boolean).length

  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
        <div className="flex items-center gap-2 font-medium">
          <Globe className="size-4" />
          Scope
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          The mini chat starts with the current note only. Web context is added only after you approve a search.
        </p>
      </div>

      <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
        <p className="font-medium">Current note</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-md border border-border/60 bg-background px-2 py-2">
            <p className="text-muted-foreground">Words</p>
            <p className="mt-1 text-sm font-medium text-foreground">{wordCount}</p>
          </div>
          <div className="rounded-md border border-border/60 bg-background px-2 py-2">
            <p className="text-muted-foreground">Lines</p>
            <p className="mt-1 text-sm font-medium text-foreground">{lineCount}</p>
          </div>
          <div className="rounded-md border border-border/60 bg-background px-2 py-2">
            <p className="text-muted-foreground">Pinned</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {note.pinned ? "Yes" : "No"}
            </p>
          </div>
          <div className="rounded-md border border-border/60 bg-background px-2 py-2">
            <p className="text-muted-foreground">Updated</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {formatTimestamp(note.updatedAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function NotesCopilot() {
  const { selectedNote } = useNotes()
  const { isMobile, open, openMobile } = useSidebar("inspector")
  const inspectorOpen = isMobile ? openMobile : open

  if (!selectedNote) {
    return (
      <p className="text-sm text-muted-foreground">
        Open a note to use the mini chat.
      </p>
    )
  }

  return (
    <Tabs defaultValue="chat" className="flex h-full min-h-0 flex-col gap-3">
      <TabsList variant="line" className="w-full justify-start bg-transparent p-0">
        <TabsTrigger value="chat" className="max-w-[120px] px-0 py-1 text-xs">
          Chat
        </TabsTrigger>
        <TabsTrigger value="info" className="max-w-[120px] px-0 py-1 text-xs">
          Info
        </TabsTrigger>
      </TabsList>
      <TabsContent value="chat" className="mt-0 flex min-h-0 flex-1 flex-col">
        <NotesMiniChat
          key={`${selectedNote._id}_${inspectorOpen ? "open" : "closed"}`}
          note={selectedNote}
        />
      </TabsContent>
      <TabsContent value="info" className="mt-0 min-h-0 flex-1 overflow-y-auto">
        <NotesInspectorInfo note={selectedNote} />
      </TabsContent>
    </Tabs>
  )
}
