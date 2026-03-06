"use client";

import { useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithApprovalResponses,
} from "ai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useNotes } from "@/components/notes";
import { useViewer } from "@/components/settings/hooks/use-viewer";
import { useSidebar } from "@/components/ui/sidebar";
import { toast } from "sonner";
import type { Note, NoteCollabState } from "@/components/notes/types";

type TextPart = {
  type: "text";
  text?: string;
};

type ToolApproval = {
  id: string;
};

type ApplyCurrentNoteEditToolPart = {
  type: "tool-applyCurrentNoteEdit";
  state:
    | "input-streaming"
    | "input-available"
    | "approval-requested"
    | "approval-responded"
    | "output-available"
    | "output-error";
  toolCallId: string;
  input?: {
    title?: string;
    content?: string;
  };
  output?: {
    ok?: boolean;
    noteId?: string;
    updatedAt?: number;
    reason?: string;
    message?: string;
  };
  errorText?: string;
  approval?: ToolApproval;
};

type MessagePart = TextPart | ApplyCurrentNoteEditToolPart | { type: string };

function getTextFromParts(parts: MessagePart[]) {
  return parts
    .filter((part): part is TextPart => part.type === "text")
    .map((part) => part.text ?? "")
    .join("");
}

function formatTimestamp(value?: number) {
  if (!value) return "Unknown time";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "Unknown time";
  }
}

function ApplyEditToolCard({
  part,
  onApprove,
  onDeny,
}: {
  part: ApplyCurrentNoteEditToolPart;
  onApprove: (approvalId: string) => Promise<void>;
  onDeny: (approvalId: string) => Promise<void>;
}) {
  const proposedTitle =
    part.input?.title && part.input.title.trim().length > 0
      ? part.input.title
      : null;
  const proposedContent = part.input?.content ?? "";

  if (part.state === "approval-requested") {
    return (
      <div className="mt-2 rounded-md border border-border/60 bg-muted/30 p-2">
        <p className="text-xs font-medium">Apply proposed note edit?</p>
        {proposedTitle ? (
          <p className="mt-1 text-xs text-muted-foreground">
            Title: {proposedTitle}
          </p>
        ) : null}
        {proposedContent ? (
          <pre className="mt-1 max-h-24 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
            {proposedContent}
          </pre>
        ) : null}
        <div className="mt-2 flex items-center gap-2">
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
    );
  }

  if (part.state === "output-available") {
    const success = part.output?.ok === true;
    return (
      <div className="mt-2 rounded-md border border-border/60 bg-muted/30 p-2 text-xs">
        {success ? (
          <p className="font-medium">Applied to note</p>
        ) : (
          <p className="font-medium text-destructive">Edit not applied</p>
        )}
        <p className="mt-1 text-muted-foreground">
          {part.output?.message ||
            (success
              ? `Updated at ${formatTimestamp(part.output?.updatedAt)}`
              : "The edit could not be applied.")}
        </p>
        {part.output?.reason ? (
          <p className="mt-1 text-muted-foreground">Reason: {part.output.reason}</p>
        ) : null}
      </div>
    );
  }

  if (part.state === "output-error") {
    return (
      <div className="mt-2 rounded-md border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive">
        {part.errorText || "Edit tool failed"}
      </div>
    );
  }

  if (part.state === "approval-responded") {
    return (
      <div className="mt-2 rounded-md border border-border/60 bg-muted/30 p-2 text-xs text-muted-foreground">
        Applying edit...
      </div>
    );
  }

  return (
    <div className="mt-2 rounded-md border border-border/60 bg-muted/30 p-2 text-xs text-muted-foreground">
      Preparing edit…
    </div>
  );
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
  const [requestSnapshot, setRequestSnapshot] = useState(() => ({
    model: modelId,
    noteContext,
  }));

  const {
    messages,
    status,
    error,
    sendMessage,
    setMessages,
    addToolApprovalResponse,
  } = useChat({
    id: `note_copilot_${note._id}`,
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
      }) => {
        const snapshotModel = requestSnapshot.model;
        const snapshotNoteContext = requestSnapshot.noteContext;

        if (!snapshotModel || !snapshotNoteContext?.noteId) {
          toast.error("Missing request context, please resend your prompt.");
          throw new Error("Missing request context for note copilot request");
        }

        return {
          headers,
          credentials,
          body: {
            id,
            messages,
            trigger,
            messageId,
            ...body,
            model: snapshotModel,
            noteContext: snapshotNoteContext,
          },
        };
      },
    }),
    sendAutomaticallyWhen:
      lastAssistantMessageIsCompleteWithApprovalResponses,
  });

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed || status === "streaming") return;
    const snapshot = {
      model: modelId,
      noteContext: {
        noteId: noteContext.noteId,
        title: noteContext.title,
        contentText: noteContext.contentText,
      },
    };
    setRequestSnapshot(snapshot);
    setInput("");
    await sendMessage(
      { text: trimmed },
      {
        body: {
          model: snapshot.model,
          noteContext: snapshot.noteContext,
        },
      },
    );
  };

  const handleApproval = async (approvalId: string, approved: boolean) => {
    try {
      await addToolApprovalResponse({
        id: approvalId,
        approved,
      });
    } catch {
      toast.error("Failed to submit approval response");
    }
  };

  const handleReset = () => {
    setRequestSnapshot({
      model: modelId,
      noteContext: {
        noteId: note._id,
        title: note.title,
        contentText: note.contentText.slice(0, 10000),
      },
    });
    setMessages([]);
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
            onClick={handleReset}
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
              {(message.parts as MessagePart[]).map((part, index) => {
                if (part.type === "text") {
                  return (
                    <p key={`${message.id}_text_${index}`} className="whitespace-pre-wrap">
                      {part.text ?? ""}
                    </p>
                  );
                }

                if (part.type === "tool-applyCurrentNoteEdit") {
                  return (
                    <ApplyEditToolCard
                      key={part.toolCallId}
                      part={part}
                      onApprove={(approvalId) => handleApproval(approvalId, true)}
                      onDeny={(approvalId) => handleApproval(approvalId, false)}
                    />
                  );
                }

                return null;
              })}
              {!getTextFromParts(message.parts as MessagePart[]) &&
              !(message.parts as MessagePart[]).some(
                (part) => part.type === "tool-applyCurrentNoteEdit",
              ) ? (
                <p className="text-xs text-muted-foreground">No renderable content.</p>
              ) : null}
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

      <Collapsible key={selectedNote._id} defaultOpen>
        <div className="rounded-md border border-border/50">
          <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2 text-left">
            <p className="text-xs font-medium">AI Collab details</p>
            <Badge variant="outline" className="h-5 text-[10px]">
              Toggle
            </Badge>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 border-t border-border/50 p-3">
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
          </CollapsibleContent>
        </div>
      </Collapsible>

      <Separator />

      {inspectorOpen ? (
        <NotesCopilotChat
          key={selectedNote._id}
          note={selectedNote}
          modelId={modelId}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Copilot chat resets while inspector is closed.
        </p>
      )}
    </div>
  );
}
