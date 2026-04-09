"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  MessageQuestionIcon,
} from "@hugeicons/core-free-icons";
import type { UIMessage } from "ai";
import {
  useChatConfig,
  useChatMessages,
  useChatMessagingActions,
  useChatThreadActions,
} from "../components/chat-provider";
import { useViewer } from "@/components/settings/hooks/use-viewer";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { PromptInputProvider } from "@/components/ai-elements/prompt-input";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ChatEmptyStateWithSuggestions } from "./components/chat-empty-state-suggestions";
import { ThreadComposerBar } from "./components/thread-composer-bar";
import { ThreadDialogs } from "./components/thread-dialogs";
import { ThreadHeader } from "./components/thread-header";
import { ThreadMessageList } from "./components/thread-message-list";
import { useThreadPageActions } from "./components/use-thread-page-actions";
import { useSidebar } from "@/components/ui/sidebar";
import { useChatInspectorFocusActions } from "@/components/app/chat-inspector-context";

import "streamdown/styles.css";
import "katex/dist/katex.min.css";

function ThreadNotFoundState({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b p-4 md:hidden">
        <Button variant="ghost" size="icon-sm" onClick={onBack}>
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            className="size-4"
            strokeWidth={2}
          />
        </Button>
        <span className="text-sm font-medium">Back to chats</span>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon
                icon={MessageQuestionIcon}
                className="size-8"
                strokeWidth={2}
              />
            </EmptyMedia>
            <EmptyTitle>Conversation not found</EmptyTitle>
            <EmptyDescription>
              This conversation may have been deleted or the link is invalid.
            </EmptyDescription>
          </EmptyHeader>
          <Button onClick={onBack}>
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              className="mr-2 size-4"
              strokeWidth={2}
            />
            Start new chat
          </Button>
        </Empty>
      </div>
    </div>
  );
}

function ThreadPageContent() {
  const router = useRouter();
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const { messages, status, error } = useChatMessages();
  const { sendText } = useChatMessagingActions();
  const { thread, project } = useChatConfig();
  const { setInspectorFocus } = useChatInspectorFocusActions();
  const { updateTitle, softDelete } = useChatThreadActions();
  const { preferences } = useViewer();
  const { isMobile, setOpen, setOpenMobile } = useSidebar("inspector");

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(thread?.title || "");
  const [clearedErrorMessage, setClearedErrorMessage] = useState<string | null>(
    null,
  );

  const shouldShowNotFound =
    thread === null && messages.length === 0 && status === "ready";

  const {
    copyAssistantMessage,
    regenerateAssistantResponse,
    saveThreadTitle,
    deleteThread,
  } = useThreadPageActions({
    messages: messages as UIMessage[],
    sendText,
    updateTitle,
    softDelete,
  });

  const handleEditTitle = async () => {
    if (!thread) return;
    const didSave = await saveThreadTitle(editTitle);
    if (!didSave) return;
    setIsEditDialogOpen(false);
  };

  const handleDeleteThread = async () => {
    if (!thread) return;
    await deleteThread();
    setIsDeleteDialogOpen(false);
    router.push("/app/chat");
  };

  const handleCompactChat = async () => {
    if (!thread) return;
    try {
      const res = await fetch("/api/chat/compact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: thread.threadId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Compaction failed");
      if (data.compacted) {
        toast.success("Chat compacted");
      } else {
        toast.info(data.message ?? "Nothing to compact");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Compaction failed");
    }
  };

  if (shouldShowNotFound) {
    return <ThreadNotFoundState onBack={() => router.push("/app/chat")} />;
  }

  const revealInspector = () => {
    if (isMobile) {
      setOpenMobile(true);
      return;
    }

    setOpen(true);
  };

  const handleInspectMessage = (messageId: string) => {
    setInspectorFocus({ type: "message", messageId });
    revealInspector();
  };

  const handleInspectTool = (messageId: string, toolCallId: string) => {
    setInspectorFocus({ type: "tool", messageId, toolCallId });
    revealInspector();
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      <ThreadHeader
        thread={thread}
        project={project}
        onBackToChats={() => router.push("/app/chat")}
        onOpenEditTitle={() => {
          setEditTitle(thread?.title || "");
          setIsEditDialogOpen(true);
        }}
        onOpenDeleteThread={() => setIsDeleteDialogOpen(true)}
        onCompactChat={handleCompactChat}
      />

      {error && error.message !== clearedErrorMessage && (
        <div className="px-4 py-3 md:px-8">
          <Alert
            variant="destructive"
            className="flex items-start justify-between gap-3"
          >
            <div>
              <AlertTitle>Chat request failed</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setClearedErrorMessage(error.message)}
            >
              Clear error
            </Button>
          </Alert>
        </div>
      )}

      <ThreadDialogs
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        onSaveTitle={() => void handleEditTitle()}
        onDeleteThread={() => void handleDeleteThread()}
      />

      <Conversation className="flex-1">
        <ConversationContent className="mx-auto flex w-full max-w-3xl flex-col">
          {messages.length === 0 ? (
            <ChatEmptyStateWithSuggestions textareaRef={composerRef} />
          ) : (
            <ThreadMessageList
              uiMessages={messages as UIMessage[]}
              status={status}
              preferences={preferences ?? undefined}
              onRegenerate={(id) => void regenerateAssistantResponse(id)}
              onCopy={(text) => void copyAssistantMessage(text)}
              onInspectMessage={handleInspectMessage}
              onInspectTool={handleInspectTool}
            />
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <ThreadComposerBar textareaRef={composerRef} />
    </div>
  );
}

export default function ThreadPage() {
  return (
    <PromptInputProvider>
      <ThreadPageContent />
    </PromptInputProvider>
  );
}
