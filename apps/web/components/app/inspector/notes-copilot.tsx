"use client";

import { useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNotes } from "@/components/notes";
import { useViewer } from "@/components/settings/hooks/use-viewer";
import { useSidebar } from "@/components/ui/sidebar";
import { toast } from "sonner";
import type { Note, NoteCollabState } from "@/components/notes/types";

function getMessageText(parts: { type: string; text?: string }[]) {
  return parts
    .filter((part) => part.type === "text")
    .map((part) => part.text ?? "")
    .join("");
}

const promptSuggestions = [
  "Summarize this note.",
  "Improve clarity and structure.",
  "Extract action items.",
];

const EMPTY_COLLAB_STATE: NoteCollabState = {
  status: "idle",
  summary: "",
  suggestions: [],
  actionItems: [],
  updatedAt: null,
  error: null,
};

function NotesCopilotChat({
  note,
  modelId,
}: {
  note: Note
  modelId: string
}) {
  const [input, setInput] = useState("");

  const noteContext = useMemo(
    () => ({
      noteId: note._id,
      title: note.title,
      contentText: note.contentText.slice(0, 10000),
    }),
    [note],
  );

  const {
    messages,
    status,
    error,
    sendMessage,
    setMessages,
  } = useChat({
    id: `note_copilot_${note._id}`,
    transport: new DefaultChatTransport({
      api: "/api/note-copilot",
    }),
  });

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed || status === "streaming") return;
    setInput("");
    await sendMessage(
      { text: trimmed },
      {
        body: {
          model: modelId,
          noteContext,
        },
      },
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="space-y-1">
        <p className="text-sm font-medium">Note Copilot</p>
        <p className="truncate text-xs text-muted-foreground">
          {note.title || "Untitled note"}
        </p>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{messages.length} messages</Badge>
          <Badge variant="outline">{status}</Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => setMessages([])}
          >
            Reset
          </Button>
        </div>
      </div>

      <Separator />

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Ask for edits, summaries, or action items based on this note.
            </p>
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
          messages.map((message) => (
            <div
              key={message.id}
              className="rounded-md border border-border/50 px-3 py-2 text-sm"
            >
              <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                {message.role}
              </p>
              <p className="whitespace-pre-wrap">
                {getMessageText(message.parts as { type: string; text?: string }[])}
              </p>
            </div>
          ))
        )}
        {error ? (
          <p className="text-xs text-destructive">
            {error.message}
          </p>
        ) : null}
      </div>

      <div className="shrink-0 space-y-2">
        <Textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask Copilot about this note…"
          className="min-h-[96px] resize-none"
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
              event.preventDefault();
              void handleSubmit();
            }
          }}
        />
        <Button
          className="w-full"
          onClick={() => void handleSubmit()}
          disabled={status === "streaming" || !input.trim()}
        >
          Send
        </Button>
      </div>
    </div>
  );
}

export function NotesCopilot() {
  const { selectedNote, collabByNoteId, runCollabNow } = useNotes();
  const { preferences } = useViewer();
  const { isMobile, open, openMobile } = useSidebar("inspector");
  const modelId = preferences?.defaultAIModel?.modelId ?? "openai/gpt-4o-mini";
  const inspectorOpen = isMobile ? openMobile : open;

  if (!selectedNote) {
    return (
      <p className="text-sm text-muted-foreground">
        Open a note to use Copilot.
      </p>
    );
  }

  const collabState = collabByNoteId[selectedNote._id] ?? EMPTY_COLLAB_STATE;
  const collabStatusLabel =
    collabState.status === "ready"
      ? "ready"
      : collabState.status === "running"
        ? "running"
        : collabState.status === "error"
          ? "error"
          : "idle";

  const copyActionItems = async () => {
    if (collabState.actionItems.length === 0) return;
    const text = collabState.actionItems.map((item) => `- ${item}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Action items copied");
    } catch {
      toast.error("Failed to copy action items");
    }
  };

  const copySuggestions = async () => {
    if (collabState.suggestions.length === 0) return;
    const text = collabState.suggestions
      .map((suggestion) => `${suggestion.title}: ${suggestion.detail}`)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Suggestions copied");
    } catch {
      toast.error("Failed to copy suggestions");
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="space-y-1">
        <p className="text-sm font-medium">AI Collab</p>
        <p className="truncate text-xs text-muted-foreground">
          {selectedNote.title || "Untitled note"}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{collabStatusLabel}</Badge>
          <Badge variant="outline">
            {collabState.suggestions.length} suggestions
          </Badge>
          <Badge variant="outline">
            {collabState.actionItems.length} action items
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => runCollabNow(selectedNote._id)}
            disabled={collabState.status === "running"}
          >
            Refresh
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => void copySuggestions()}
            disabled={collabState.suggestions.length === 0}
          >
            Copy suggestions
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => void copyActionItems()}
            disabled={collabState.actionItems.length === 0}
          >
            Copy actions
          </Button>
        </div>
      </div>

      <div className="space-y-2 rounded-md border border-border/50 p-3">
        {collabState.summary ? (
          <p className="text-sm">{collabState.summary}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Suggestions appear after note content saves.
          </p>
        )}
        {collabState.error ? (
          <p className="text-xs text-destructive">{collabState.error}</p>
        ) : null}
        {collabState.suggestions.length > 0 ? (
          <div className="space-y-2">
            {collabState.suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="rounded-md border border-border/50 px-2 py-1.5"
              >
                <div className="mb-1 flex items-center gap-2">
                  <p className="text-xs font-medium">{suggestion.title}</p>
                  <Badge variant="outline" className="h-5 text-[10px]">
                    {suggestion.kind}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{suggestion.detail}</p>
              </div>
            ))}
          </div>
        ) : null}
        {collabState.actionItems.length > 0 ? (
          <div className="space-y-1">
            <p className="text-xs font-medium">Action items</p>
            {collabState.actionItems.map((item) => (
              <p key={item} className="text-xs text-muted-foreground">
                - {item}
              </p>
            ))}
          </div>
        ) : null}
      </div>

      <Separator />

      {inspectorOpen ? (
        <NotesCopilotChat note={selectedNote} modelId={modelId} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Copilot chat resets while inspector is closed.
        </p>
      )}
    </div>
  );
}
