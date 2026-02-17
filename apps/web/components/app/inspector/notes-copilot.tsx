"use client";

import { useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNotes } from "@/components/notes";
import { useViewer } from "@/components/settings/hooks/use-viewer";

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

export function NotesCopilot() {
  const [input, setInput] = useState("");
  const { selectedNote } = useNotes();
  const { preferences } = useViewer();
  const modelId =
    preferences?.defaultAIModel?.modelId ?? "openai/gpt-4o-mini";

  const noteContext = useMemo(
    () =>
      selectedNote
        ? {
          noteId: selectedNote._id,
          title: selectedNote.title,
          contentText: selectedNote.contentText.slice(0, 10000),
        }
        : null,
    [selectedNote],
  );

  const {
    messages,
    status,
    error,
    sendMessage,
    setMessages,
  } = useChat({
    id: selectedNote ? `note_copilot_${selectedNote._id}` : "note_copilot",
    api: "/api/note-copilot",
  });

  if (!selectedNote) {
    return (
      <p className="text-sm text-muted-foreground">
        Open a note to use Copilot.
      </p>
    );
  }

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed || !noteContext || status === "streaming") return;
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
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="space-y-1">
        <p className="text-sm font-medium">Note Copilot</p>
        <p className="text-xs text-muted-foreground truncate">{selectedNote.title || "Untitled note"}</p>
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
