"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  PromptInput,
  PromptInputProvider,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputHeader,
  PromptInputFooter,
  PromptInputTools,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  usePromptInputController,
} from "@/components/ai-elements/prompt-input";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/ai-elements/reasoning";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  GlobalIcon,
  FolderManagementIcon,
  MessageQuestionIcon,
  MoreHorizontalIcon,
  PencilEdit01Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import type { UIMessage } from "ai";
import { useChatContext } from "../components/chat-provider";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function ThreadPageContent() {
  const router = useRouter();
  const {
    messages,
    status,
    stop,
    sendText,
    thread,
    project,
    selectedModelId,
    setSelectedModelId,
    availableModels,
  } = useChatContext();
  const { textInput } = usePromptInputController();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(thread?.title || "");

  const updateThreadTitle = useMutation(api.chat.updateThreadTitle);
  const softDeleteThread = useMutation(api.chat.softDeleteThread);

  const shouldShowNotFound =
    thread === null && messages.length === 0 && status === "ready";

  const handleEditTitle = async () => {
    if (!thread || !editTitle.trim()) return;
    await updateThreadTitle({
      threadId: thread.threadId,
      title: editTitle.trim(),
    });
    setIsEditDialogOpen(false);
  };

  const handleDeleteThread = async () => {
    if (!thread) return;
    await softDeleteThread({ threadId: thread.threadId });
    setIsDeleteDialogOpen(false);
    router.push("/app/chat");
  };

  // Not found state
  if (shouldShowNotFound) {
    return (
      <div className="flex flex-col h-full">
        {/* Mobile header */}
        <div className="flex items-center gap-2 p-4 border-b md:hidden">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/app/chat")}
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              className="size-4"
              strokeWidth={2}
            />
          </Button>
          <span className="text-sm font-medium">Back to chats</span>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
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
            <Button onClick={() => router.push("/app/chat")}>
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                className="size-4 mr-2"
                strokeWidth={2}
              />
              Start new chat
            </Button>
          </Empty>
        </div>
      </div>
    );
  }

  const uiMessages = useMemo(() => messages ?? [], [messages]);

  const handleSubmit = () => {
    if (!textInput.value.trim()) return;
    void sendText(textInput.value);
    textInput.clear();
  };

  const renderMessageText = (message: UIMessage) =>
    message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("");

  const renderMessageReasoning = (message: UIMessage) => {
    const reasoningParts = message.parts.filter(
      (part) => part.type === "reasoning",
    );
    if (reasoningParts.length === 0) return null;
    return reasoningParts
      .map((part) => (part as { type: "reasoning"; text: string }).text)
      .join("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* Sidebar trigger for desktop */}
          <div className="hidden md:block">
            <SidebarTrigger />
          </div>

          {/* Mobile back button */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/app/chat")}
            className="md:hidden"
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              className="size-4"
              strokeWidth={2}
            />
            <span className="sr-only">Back to chats</span>
          </Button>

          <div className="min-w-0">
            <h2 className="text-sm font-medium truncate">
              {thread?.title || "New chat"}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              {project ? (
                <Badge
                  variant="outline"
                  className="rounded-md text-[10px] h-4 px-1"
                >
                  <HugeiconsIcon
                    icon={FolderManagementIcon}
                    className="size-3 mr-1"
                    strokeWidth={2}
                  />
                  {project.icon} {project.title}
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="rounded-md text-[10px] h-4 px-1"
                >
                  <HugeiconsIcon
                    icon={GlobalIcon}
                    className="size-3 mr-1"
                    strokeWidth={2}
                  />
                  All workspace
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Options dropdown */}
        {thread && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <HugeiconsIcon
                  icon={MoreHorizontalIcon}
                  className="size-4"
                  strokeWidth={2}
                />
                <span className="sr-only">Conversation actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setEditTitle(thread.title || "");
                  setIsEditDialogOpen(true);
                }}
              >
                <HugeiconsIcon
                  icon={PencilEdit01Icon}
                  className="size-4 mr-2"
                  strokeWidth={2}
                />
                Edit title
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <HugeiconsIcon
                  icon={Delete02Icon}
                  className="size-4 mr-2"
                  strokeWidth={2}
                />
                Delete thread
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Edit Title Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit conversation title</DialogTitle>
            <DialogDescription>
              Change the title of this conversation.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Enter new title"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleEditTitle();
              }
            }}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditTitle} disabled={!editTitle.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete conversation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this conversation? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteThread}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Conversation */}
      <Conversation className="flex-1">
        <ConversationContent className="mx-auto w-full max-w-6xl px-3 py-6 gap-4">
          {uiMessages.length === 0 ? (
            <ConversationEmptyState
              title="Start a new conversation"
              description="Ask anything, or use a prompt suggestion"
            />
          ) : (
            uiMessages.map((message) => {
              const reasoningText = renderMessageReasoning(message);
              const hasReasoning = !!reasoningText;

              return (
                <Message
                  key={message.id}
                  from={message.role}
                  className={cn(
                    "max-w-none gap-1.5",
                    message.role === "user" && "justify-end",
                  )}
                >
                  <MessageContent
                    className={cn(
                      "text-sm leading-6",
                      message.role === "assistant" &&
                        "w-full border-l border-border/50 pl-6",
                      message.role === "user" &&
                        "border border-border/60 bg-muted/40 px-4 py-3 max-w-[32rem] rounded-lg",
                    )}
                  >
                    {message.role === "assistant" ? (
                      <div className="flex flex-col gap-4">
                        {hasReasoning && (
                          <Reasoning isStreaming={status === "streaming"}>
                            <ReasoningTrigger />
                            <ReasoningContent>{reasoningText}</ReasoningContent>
                          </Reasoning>
                        )}
                        <MessageResponse className="text-sm leading-6">
                          {renderMessageText(message)}
                        </MessageResponse>
                      </div>
                    ) : (
                      <div className="text-sm whitespace-pre-wrap">
                        {renderMessageText(message)}
                      </div>
                    )}
                  </MessageContent>
                </Message>
              );
            })
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Composer */}
      <div className="shrink-0 border-t border-border/60 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <label htmlFor="thread-message" className="sr-only">
          Message
        </label>
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputHeader>
            <PromptInputTools></PromptInputTools>
          </PromptInputHeader>

          <PromptInputTextarea
            id="thread-message"
            placeholder="Continue the conversation..."
          />

          <PromptInputFooter>
            {availableModels.length > 0 && (
              <PromptInputSelect
                value={selectedModelId ?? undefined}
                onValueChange={setSelectedModelId}
              >
                <PromptInputSelectTrigger className="h-7 text-[11px] px-2">
                  <PromptInputSelectValue placeholder="Select model" />
                </PromptInputSelectTrigger>
                <PromptInputSelectContent>
                  {availableModels.map((model) => (
                    <PromptInputSelectItem
                      key={model.modelId}
                      value={model.modelId}
                    >
                      {model.name}
                    </PromptInputSelectItem>
                  ))}
                </PromptInputSelectContent>
              </PromptInputSelect>
            )}
            <PromptInputTools></PromptInputTools>
            <PromptInputSubmit status={status} onStop={stop} />
          </PromptInputFooter>
        </PromptInput>
      </div>
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
