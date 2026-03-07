"use client"

import { useEffect, useMemo, useState } from "react"
import { useChat } from "@ai-sdk/react"
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithApprovalResponses,
} from "ai"
import {
  AlertCircle,
  CheckCircle2,
  Clipboard,
  FileText,
  Globe,
  Loader2,
  Search,
  Sparkles,
  Wand2,
} from "lucide-react"
import { toast } from "sonner"
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import { Message, MessageContent } from "@/components/ai-elements/message"
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input"
import { useNotes } from "@/components/notes"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import {
  createReviewerChatPrompt,
  createReviewerSignature,
} from "@/lib/notes/reviewer"
import type { Note, NoteReviewerSuggestion } from "@/components/notes/types"

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

function isReplaceCurrentNoteToolPart(
  part: MessagePart,
): part is ReplaceCurrentNoteToolPart {
  return part.type === "tool-replaceCurrentNote"
}

function isSearchWebToolPart(
  part: MessagePart,
): part is SearchWebForNoteContextToolPart {
  return part.type === "tool-searchWebForNoteContext"
}

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
                <Badge key={item} variant="outline" className="h-5 text-xs">
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
            <Badge variant="outline" className="h-5 text-xs">
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
                <p className="mt-1 truncate text-xs text-muted-foreground">{result.url}</p>
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
  const { pendingChatPrompt, clearPendingChatPrompt } = useNotes()
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
    stop,
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

  const handleSubmit = async (text = input) => {
    const trimmed = text.trim()
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

  useEffect(() => {
    if (!pendingChatPrompt || pendingChatPrompt.noteId !== note._id) return
    const animationFrame = window.requestAnimationFrame(() => {
      setInput(pendingChatPrompt.prompt)
    })
    clearPendingChatPrompt(note._id)
    return () => {
      window.cancelAnimationFrame(animationFrame)
    }
  }, [clearPendingChatPrompt, note._id, pendingChatPrompt])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Notes mini chat
            </p>
            <p className="truncate text-sm font-medium">
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
          <Badge variant="secondary" className="h-6 gap-1 rounded-full text-xs">
            <FileText className="size-3" />
            Using current note only
          </Badge>
          <Badge variant="outline" className="h-6 rounded-full text-xs">
            {messages.length} messages
          </Badge>
        </div>
      </div>

      <Separator />

      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="flex w-full flex-col gap-4 px-0 py-1 pr-1">
          {messages.length === 0 ? (
            <ConversationEmptyState
              className="min-h-[260px] rounded-xl border border-dashed border-border/70 bg-muted/20 p-4 text-left"
              icon={<Sparkles className="size-4" />}
              title="Ask about this note"
              description="I can answer questions from the current note, rewrite it with approval, or search the web when you ask for outside information."
              suggestions={promptSuggestions.map((prompt) => ({
                title: prompt,
                value: prompt,
              }))}
              onSuggestionSelect={(value) => setInput(value)}
            />
          ) : (
            messages.map((message) => {
              const parts = message.parts as MessagePart[]
              const text = getTextFromParts(parts)

              return (
                <Message
                  key={message.id}
                  from={message.role}
                  className={cn("max-w-none gap-1.5", message.role === "user" && "justify-end")}
                >
                  <MessageContent
                    className={cn(
                      "text-[15px] leading-7",
                      message.role === "assistant" && "w-full",
                      message.role === "user" && "max-w-xl",
                    )}
                  >
                    {text ? <p className="whitespace-pre-wrap">{text}</p> : null}
                    {parts.map((part) => {
                      if (isReplaceCurrentNoteToolPart(part)) {
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

                      if (isSearchWebToolPart(part)) {
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
                  </MessageContent>
                </Message>
              )
            })
          )}
          {error ? <p className="text-xs text-destructive">{error.message}</p> : null}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="shrink-0 border-t border-border/40 pt-3">
        <PromptInput
          onSubmit={({ text }) => handleSubmit(text)}
          className="**:data-[slot=input-group]:rounded-3xl **:data-[slot=input-group]:border-border/60 **:data-[slot=input-group]:bg-background **:data-[slot=input-group]:shadow-sm **:data-[slot=input-group]:transition-colors **:data-[slot=input-group]:has-[[data-slot=input-group-control]:focus-visible]:border-ring/50 **:data-[slot=input-group]:has-[[data-slot=input-group-control]:focus-visible]:ring-2 **:data-[slot=input-group]:has-[[data-slot=input-group-control]:focus-visible]:ring-ring/20"
        >
          <PromptInputTextarea
            id="notes-mini-chat-message"
            aria-label="Ask about this note"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about this note..."
            className="min-h-[72px] max-h-56 px-3 py-2.5 text-[15px] leading-7"
          />
          <PromptInputFooter className="border-t border-border/45 pb-2.5 pt-2 text-muted-foreground">
            <div className="flex items-center gap-2 text-xs">
              {status === "streaming" || status === "submitted" ? (
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  Generating response
                </span>
              ) : (
                <span>Enter to send</span>
              )}
            </div>
            <PromptInputSubmit
              status={status}
              onStop={stop}
              size="icon-sm"
              className="size-8 rounded-full"
              disabled={status !== "streaming" && status !== "submitted" && !input.trim()}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  )
}

function ReviewerScoreCard({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="rounded-md border border-border/50 bg-background px-2.5 py-2.5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}/5</p>
    </div>
  )
}

function ReviewerSuggestionCard({
  suggestion,
  onAskChat,
}: {
  suggestion: NoteReviewerSuggestion
  onAskChat: (prompt: string) => void
}) {
  const prompt = createReviewerChatPrompt(suggestion.title, suggestion.detail)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      toast.success("Suggestion copied")
    } catch {
      toast.error("Failed to copy suggestion")
    }
  }

  return (
    <div className="rounded-md border border-border/50 bg-background p-3 transition-colors duration-200 hover:bg-muted/30">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-foreground">{suggestion.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{suggestion.detail}</p>
        </div>
        <Badge variant="outline" className="capitalize">
          {suggestion.kind}
        </Badge>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Button
          size="sm"
          className="h-7 px-2 text-xs transition-colors duration-200"
          onClick={() => onAskChat(prompt)}
        >
          Ask chat
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs transition-colors duration-200"
          onClick={() => void handleCopy()}
        >
          <Clipboard className="mr-1 size-3.5" />
          Copy
        </Button>
      </div>
    </div>
  )
}

function NotesInspectorReviewer({
  note,
  onAskChat,
}: {
  note: Note
  onAskChat: (prompt: string) => void
}) {
  const { reviewerRunStateByNoteId } = useNotes()
  const runState = reviewerRunStateByNoteId[note._id]
  const currentSignature = createReviewerSignature({
    title: note.title,
    contentText: note.contentText,
  })
  const reviewer =
    note.reviewer?.contentSignature === currentSignature ? note.reviewer : undefined
  const status = runState?.status ?? (reviewer ? "ready" : "idle")
  const error = runState?.error ?? null

  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Reviewer
            </p>
            <p className="text-sm font-medium">Latest note review</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Runs after meaningful note saves and keeps the latest review for this note.
            </p>
          </div>
          <Badge
            variant={
              status === "error"
                ? "destructive"
                : status === "reviewing"
                  ? "secondary"
                  : "outline"
            }
            className="capitalize"
          >
            {status === "reviewing" ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}
            {status}
          </Badge>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          {status === "reviewing" ? <Loader2 className="size-3.5 animate-spin" /> : null}
          {status === "ready" ? <CheckCircle2 className="size-3.5 text-emerald-600" /> : null}
          {status === "error" ? <AlertCircle className="size-3.5 text-destructive" /> : null}
          <span>
            {status === "reviewing"
              ? "Analyzing note..."
              : reviewer
              ? `Last reviewed ${formatTimestamp(reviewer.updatedAt)}`
              : "No review has been generated yet."}
          </span>
        </div>
        {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
      </div>

      {!reviewer ? (
        <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-4">
          <p className="text-sm font-medium">Waiting for a meaningful save</p>
          <p className="mt-1 text-xs text-muted-foreground">
            The reviewer runs automatically after note content changes and saves.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Summary
              </p>
              <Badge variant="outline">{reviewer.noteType}</Badge>
            </div>
            <p className="mt-2 text-sm font-medium text-foreground">{reviewer.summary}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <ReviewerScoreCard label="Clarity" value={reviewer.scores.clarity} />
            <ReviewerScoreCard label="Structure" value={reviewer.scores.structure} />
            <ReviewerScoreCard
              label="Scannability"
              value={reviewer.scores.scannability}
            />
            <ReviewerScoreCard
              label="Actionability"
              value={reviewer.scores.actionability}
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Top Issues
            </p>
            {reviewer.topIssues.length > 0 ? (
              reviewer.topIssues.map((issue) => (
                <div
                  key={`${issue.title}_${issue.detail}`}
                  className="rounded-md border border-border/50 bg-background p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{issue.title}</p>
                    <Badge variant="outline" className="capitalize">
                      {issue.severity}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{issue.detail}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No major issues detected.</p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Suggestions
            </p>
            {reviewer.suggestions.length > 0 ? (
              reviewer.suggestions.map((suggestion) => (
                <ReviewerSuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onAskChat={onAskChat}
                />
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No suggestions available.</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Action items
              </p>
              {reviewer.actionItems.length > 0 ? (
                <ul className="mt-2 space-y-2 text-xs text-muted-foreground">
                  {reviewer.actionItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">
                  No action items extracted.
                </p>
              )}
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Open questions
              </p>
              {reviewer.openQuestions.length > 0 ? (
                <ul className="mt-2 space-y-2 text-xs text-muted-foreground">
                  {reviewer.openQuestions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">
                  No open questions extracted.
                </p>
              )}
            </div>
          </div>
        </>
      )}
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
          The mini chat and reviewer use the current note only. Web search in chat is only used when you explicitly ask for outside information.
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
  const { selectedNote, handoffReviewerSuggestionToChat } = useNotes()
  const { isMobile, open, openMobile } = useSidebar("inspector")
  const inspectorOpen = isMobile ? openMobile : open
  const [activeTab, setActiveTab] = useState("chat")

  if (!selectedNote) {
    return (
      <p className="text-sm text-muted-foreground">
        Open a note to use the mini chat.
      </p>
    )
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="flex h-full min-h-0 flex-col gap-3"
    >
      <TabsList variant="line" className="w-full justify-start bg-transparent p-0">
        <TabsTrigger value="chat" className="max-w-[120px] px-0 py-1 text-xs">
          Chat
        </TabsTrigger>
        <TabsTrigger value="reviewer" className="max-w-[120px] px-0 py-1 text-xs">
          Reviewer
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
      <TabsContent value="reviewer" className="mt-0 min-h-0 flex-1 overflow-y-auto">
        <NotesInspectorReviewer
          note={selectedNote}
          onAskChat={(prompt) => {
            handoffReviewerSuggestionToChat(selectedNote._id, prompt)
            setActiveTab("chat")
          }}
        />
      </TabsContent>
      <TabsContent value="info" className="mt-0 min-h-0 flex-1 overflow-y-auto">
        <NotesInspectorInfo note={selectedNote} />
      </TabsContent>
    </Tabs>
  )
}
