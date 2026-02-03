"use client";

import { useParams, useRouter } from "next/navigation";
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
import {
  mockProjects,
  mockThreads,
  mockMessagesByThreadId,
} from "../components/mock-data";

export default function ThreadPage() {
  const params = useParams();
  const router = useRouter();
  const threadId = params.threadId as string;

  const thread = mockThreads.find((item) => item.id === threadId);
  const project = thread?.projectId
    ? mockProjects.find((p) => p.id === thread.projectId)
    : undefined;
  const messages = thread ? (mockMessagesByThreadId[thread.id] ?? []) : [];
  const isTempThread = threadId.startsWith("temp-");

  // Not found state
  if (!thread && !isTempThread) {
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

  return (
    <PromptInputProvider>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur shrink-0">
          <div className="flex items-center gap-3">
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
            </Button>

            <div>
              <h2 className="text-sm font-medium">
                {thread?.title || "New chat"}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                {project ? (
                  <Badge
                    variant="outline"
                    className="rounded-none text-[10px] h-4 px-1"
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
                    className="rounded-none text-[10px] h-4 px-1"
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
          </Button>
        </div>

        {/* Conversation */}
        <Conversation className="flex-1">
          <ConversationContent className="p-4 space-y-6">
            {messages.length === 0 ? (
              <ConversationEmptyState
                title="Start a new conversation"
                description="Ask anything, or use a prompt suggestion"
              />
            ) : (
              messages.map((message) => (
                <Message
                  key={message.id}
                  from={message.role}
                  className={cn(message.role === "user" && "justify-end")}
                >
                  <MessageContent className="max-w-[80%]">
                    {message.role === "assistant" ? (
                      <MessageResponse>{message.content}</MessageResponse>
                    ) : (
                      <div className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </div>
                    )}
                  </MessageContent>
                </Message>
              ))
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {/* Composer */}
        <div className="shrink-0 border-t bg-background/80 backdrop-blur p-4 pb-[env(safe-area-inset-bottom)]">
          <div className="max-w-3xl mx-auto">
            <PromptInput onSubmit={() => {}}>
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

              <PromptInputTextarea placeholder="Continue the conversation..." />

              <PromptInputFooter>
                <PromptInputTools>
                  <span className="text-xs text-muted-foreground">
                    Press Enter to send, Shift+Enter for new line
                  </span>
                </PromptInputTools>
                <PromptInputSubmit />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
      </div>
    </PromptInputProvider>
  );
}
