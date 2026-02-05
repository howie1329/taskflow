"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PromptInput,
  PromptInputProvider,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputHeader,
  PromptInputFooter,
  PromptInputTools,
  PromptInputButton,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
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
  Image01Icon,
  PlusSignIcon,
  MessageQuestionIcon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons";
import type { UIMessage } from "ai";
import { useChatContext } from "../components/chat-provider";

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

  const shouldShowNotFound =
    thread === null && messages.length === 0 && status === "ready";

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
    <div className="flex flex-col h-full w-full min-h-0">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-border/60 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
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

        <Button variant="ghost" size="icon-sm">
          <HugeiconsIcon
            icon={MoreHorizontalIcon}
            className="size-4"
            strokeWidth={2}
          />
          <span className="sr-only">Conversation actions</span>
        </Button>
      </div>

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
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger>
                  <HugeiconsIcon
                    icon={PlusSignIcon}
                    className="size-4"
                    strokeWidth={2}
                  />
                </PromptInputActionMenuTrigger>
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <PromptInputButton variant="ghost" size="icon-sm">
                <HugeiconsIcon
                  icon={Image01Icon}
                  className="size-4"
                  strokeWidth={2}
                />
              </PromptInputButton>
            </PromptInputTools>
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
            <PromptInputTools>
              <span className="hidden sm:block text-xs text-muted-foreground">
                Press Enter to send, Shift+Enter for new line
              </span>
            </PromptInputTools>
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
