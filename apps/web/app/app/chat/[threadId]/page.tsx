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
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
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

// Mock projects
const mockProjects = [
  { id: "p1", title: "Website Redesign", icon: "🎨" },
  { id: "p2", title: "Mobile App", icon: "📱" },
  { id: "p3", title: "Q1 Planning", icon: "📊" },
];

// Mock threads with messages
const mockThreads: Record<
  string,
  {
    title: string;
    projectId?: string;
    messages: Array<{
      id: string;
      role: "user" | "assistant";
      content: string;
    }>;
  }
> = {
  t1: {
    title: "Planning Q1 roadmap",
    messages: [
      { id: "m1", role: "user", content: "Help me plan the Q1 roadmap" },
      {
        id: "m2",
        role: "assistant",
        content:
          "I'd be happy to help you plan your Q1 roadmap. Let me break this down into key areas:\n\n1. **Goals & Objectives** - What are the main outcomes you want to achieve?\n2. **Key Projects** - Which major initiatives need to be completed?\n3. **Timeline** - When do these need to be delivered?\n4. **Resources** - What team members and budget are available?\n\nCould you share more details about your current priorities?",
      },
      {
        id: "m3",
        role: "user",
        content:
          "We need to focus on the website redesign and mobile app launch",
      },
      {
        id: "m4",
        role: "assistant",
        content:
          "Great focus areas! Here's a suggested Q1 plan:\n\n**January:**\n- Finalize website redesign requirements\n- Begin mobile app development\n- Set up analytics and tracking\n\n**February:**\n- Website redesign implementation\n- Mobile app beta testing\n- Content migration planning\n\n**March:**\n- Website launch preparation\n- Mobile app store submission\n- Post-launch monitoring setup\n\nWould you like me to create tasks for any of these phases?",
      },
    ],
  },
  t2: {
    title: "Website redesign ideas",
    projectId: "p1",
    messages: [
      {
        id: "m1",
        role: "user",
        content: "What are some good color schemes for a modern SaaS website?",
      },
      {
        id: "m2",
        role: "assistant",
        content:
          "Here are some popular color schemes for modern SaaS websites:\n\n1. **Blue & White (Classic)** - Trust, professionalism\n2. **Purple & Pink (Creative)** - Innovation, uniqueness\n3. **Green & Neutral (Growth)** - Sustainability, growth\n4. **Dark Mode (Modern)** - Sleek, developer-friendly\n\nConsider your target audience and brand personality when choosing.",
      },
    ],
  },
  t3: {
    title: "Task prioritization",
    messages: [
      {
        id: "m1",
        role: "user",
        content: "How should I prioritize my backlog?",
      },
      {
        id: "m2",
        role: "assistant",
        content:
          "Here's a framework for prioritizing your backlog:\n\n**1. Impact vs Effort Matrix**\n- High Impact, Low Effort: Do first\n- High Impact, High Effort: Plan carefully\n- Low Impact, Low Effort: Quick wins\n- Low Impact, High Effort: Deprioritize\n\n**2. RICE Scoring**\n- Reach, Impact, Confidence, Effort\n\n**3. MoSCoW Method**\n- Must have, Should have, Could have, Won't have\n\nWould you like me to help apply any of these to your specific tasks?",
      },
    ],
  },
};

export default function ThreadPage() {
  const params = useParams();
  const router = useRouter();
  const threadId = params.threadId as string;

  const thread = mockThreads[threadId];
  const project = thread?.projectId
    ? mockProjects.find((p) => p.id === thread.projectId)
    : undefined;

  // Not found state
  if (!thread) {
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
        <div className="flex items-center justify-between p-4 border-b shrink-0">
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
                {thread.title || "Untitled chat"}
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
            {thread.messages.map((message) => (
              <Message
                key={message.id}
                from={message.role}
                className={cn(message.role === "user" && "justify-end")}
              >
                <MessageContent
                  className={cn(
                    "max-w-[80%]",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted",
                  )}
                >
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </div>
                </MessageContent>
              </Message>
            ))}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {/* Composer */}
        <div className="shrink-0 border-t bg-background/80 backdrop-blur p-4">
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
