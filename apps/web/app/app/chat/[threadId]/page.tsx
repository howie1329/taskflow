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
  usePromptInputController,
} from "@/components/ai-elements/prompt-input";
import {
  ProjectSelector,
  ProjectSelectorTrigger,
  ProjectSelectorContent,
  ProjectSelectorList,
  ProjectSelectorItem,
  ProjectSelectorGroup,
  ProjectSelectorEmpty,
} from "@/components/ai-elements/project-selector";
import {
  ModelSelector,
  ModelSelectorTrigger,
  ModelSelectorContent,
  ModelSelectorInput,
  ModelSelectorList,
  ModelSelectorItem,
  ModelSelectorGroup,
  ModelSelectorName,
} from "@/components/ai-elements/model-selector";
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
  ChainOfThought,
  EnhancedChainOfThoughtHeader,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought";
import {
  Tool,
  EnhancedToolHeader,
  ToolContent,
  ToolSummaryBar,
  ToolMetaPanel,
} from "@/components/ai-elements/tool";
import {
  detectProvider,
  providerConfig,
} from "@/components/ai-elements/provider-badge";
import {
  Sources,
  SourcesTrigger,
  SourcesContent,
  Source,
} from "@/components/ai-elements/sources";
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
import type { UIMessage, ToolUIPart, DynamicToolUIPart } from "ai";
import {
  type TavilyWebSearchOutput,
  isTavilyWebSearchOutput,
  normalizeTavilyOutput,
} from "@/lib/AITools/Tavily/types";
import { TavilyWebSearchCard } from "@/components/ai-elements/tavily-web-search-card";
import { useChatContext } from "../components/chat-provider";
import { useViewer } from "@/components/settings/hooks/use-viewer";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type ToolCall = {
  id: string;
  toolName: string;
  state: ToolUIPart["state"];
  input?: unknown;
  output?: unknown;
  errorText?: string;
};

type ToolStateInfo = {
  badgeLabel: string;
  stepStatus: "pending" | "active" | "complete";
  isError: boolean;
};

function getToolDisplayName(part: ToolUIPart | DynamicToolUIPart): string {
  if (part.type === "dynamic-tool" && "toolName" in part) {
    const name = part.toolName;
    if (name === "webSearch") return "Web search";
    return name
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s) => s.toUpperCase());
  }
  const baseType = part.type.split("-").slice(1).join("-");
  if (baseType === "webSearch") return "Web search";
  return baseType
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase());
}

function getToolStateInfo(state: ToolUIPart["state"]): ToolStateInfo {
  const stateMap: Record<ToolUIPart["state"], ToolStateInfo> = {
    "input-streaming": {
      badgeLabel: "Pending",
      stepStatus: "pending",
      isError: false,
    },
    "input-available": {
      badgeLabel: "Running",
      stepStatus: "active",
      isError: false,
    },
    "approval-requested": {
      badgeLabel: "Awaiting approval",
      stepStatus: "active",
      isError: false,
    },
    "approval-responded": {
      badgeLabel: "Approved",
      stepStatus: "complete",
      isError: false,
    },
    "output-available": {
      badgeLabel: "Completed",
      stepStatus: "complete",
      isError: false,
    },
    "output-error": {
      badgeLabel: "Error",
      stepStatus: "complete",
      isError: true,
    },
    "output-denied": {
      badgeLabel: "Denied",
      stepStatus: "complete",
      isError: true,
    },
  };
  return (
    stateMap[state] ?? {
      badgeLabel: state,
      stepStatus: "pending",
      isError: false,
    }
  );
}

function getToolInputSummary(input: unknown): string | null {
  if (!input || typeof input !== "object") return null;
  const inputObj = input as Record<string, unknown>;
  if ("query" in inputObj && typeof inputObj.query === "string") {
    return `Searching the web for "${inputObj.query}"`;
  }
  if ("title" in inputObj && typeof inputObj.title === "string") {
    return `Creating "${inputObj.title}"`;
  }
  if ("name" in inputObj && typeof inputObj.name === "string") {
    return `Processing "${inputObj.name}"`;
  }
  return null;
}

function summarizeToolOutput(output: unknown): string | null {
  if (output === null || output === undefined) return null;

  if (typeof output === "string") {
    const trimmed = output.trim();
    if (trimmed.length === 0) return null;
    return trimmed.length > 150 ? `${trimmed.slice(0, 150)}...` : trimmed;
  }

  if (typeof output === "object" && !Array.isArray(output)) {
    const obj = output as Record<string, unknown>;
    const entries = Object.entries(obj).filter((entry) => {
      const value = entry[1];
      if (value === null || value === undefined) return false;
      if (typeof value === "object" && !Array.isArray(value)) return false;
      if (typeof value === "string" && value.length > 100) return false;
      return true;
    });

    if (entries.length === 0) return null;

    if (entries.length === 1) {
      const [key, value] = entries[0];
      return `${key}: ${value}`;
    }

    const summary = entries
      .slice(0, 3)
      .map(([key, value]) => {
        const label = key
          .replace(/_/g, " ")
          .replace(/([A-Z])/g, " $1")
          .trim();
        return `${label}: ${value}`;
      })
      .join(" · ");

    return summary;
  }

  return null;
}

function describeValue(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "—";
  if (Array.isArray(value)) return `${value.length} items`;
  if (typeof value === "object")
    return `${Object.keys(value as object).length} fields`;
  return String(value);
}

function getToolSummary(toolCall: ToolCall): string | null {
  if (toolCall.toolName === "webSearch" && isWebSearchOutput(toolCall.output)) {
    const output = toolCall.output as WebSearchOutput;
    return `Found ${output.results.length} sources`;
  }

  const outputSummary = summarizeToolOutput(toolCall.output);
  if (outputSummary) return outputSummary;

  const inputSummary = getToolInputSummary(toolCall.input);
  if (inputSummary) return inputSummary;

  return null;
}

function getToolMetaItems(toolCall: ToolCall) {
  const providerType = detectProvider(toolCall.toolName);
  const providerName = providerConfig[providerType]?.name ?? "Unknown";

  const items = [
    { label: "Provider", value: providerName },
    { label: "Tool", value: toolCall.toolName.replace(/^tool-/, "") },
    { label: "Status", value: toolCall.state.replace(/-/g, " ") },
  ];

  if (toolCall.input && typeof toolCall.input === "object") {
    items.push({
      label: "Input",
      value: describeValue(toolCall.input),
    });
  }

  if (toolCall.output !== undefined) {
    items.push({
      label: "Output",
      value: describeValue(toolCall.output),
    });
  }

  if (toolCall.errorText) {
    items.push({ label: "Error", value: "Yes" });
  }

  return items;
}

function renderToolContent(toolCall: ToolCall): React.ReactNode {
  if (
    toolCall.state !== "output-available" &&
    toolCall.state !== "output-error"
  ) {
    return (
      <p className="text-muted-foreground text-sm">
        {getToolStateInfo(toolCall.state).badgeLabel}...
      </p>
    );
  }

  if (toolCall.errorText) {
    return <p className="text-destructive text-sm">{toolCall.errorText}</p>;
  }

  // Tavly-specific web search rendering with enhanced card UI
  if (
    toolCall.toolName === "tool-tavilyWebSearch" &&
    isTavilyWebSearchOutput(toolCall.output)
  ) {
    // Normalize the output to handle both snake_case (API) and camelCase (schema) formats
    const output = normalizeTavilyOutput(
      toolCall.output as unknown as Record<string, unknown>,
    );
    return <TavilyWebSearchCard {...output} />;
  }

  //Might deprecate this as there are no tool calls called webSearch anymore
  if (toolCall.toolName === "webSearch" && isWebSearchOutput(toolCall.output)) {
    const output = toolCall.output as WebSearchOutput;
    return (
      <div className="space-y-2">
        {output.results.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Found {output.results.length} source
            {output.results.length !== 1 ? "s" : ""}
          </p>
        )}
        {output.answer && <p className="text-sm">{output.answer}</p>}
        {output.results.length > 0 && (
          <Sources>
            <SourcesTrigger count={output.results.length} />
            <SourcesContent>
              {output.results.slice(0, 5).map((result, index) => (
                <Source key={index} href={result.url} title={result.title}>
                  {result.title}
                </Source>
              ))}
            </SourcesContent>
          </Sources>
        )}
      </div>
    );
  }

  const summary = summarizeToolOutput(toolCall.output);
  if (summary) {
    return <p className="text-sm">{summary}</p>;
  }

  return <p className="text-muted-foreground text-sm">Done</p>;
}

function getToolCalls(message: UIMessage): ToolCall[] {
  return message.parts
    .filter((part): part is ToolUIPart | DynamicToolUIPart => {
      if (typeof part.type !== "string") return false;
      return part.type.startsWith("tool-") || part.type === "dynamic-tool";
    })
    .map((part) => ({
      id: part.toolCallId ?? `tool-${Math.random().toString(36).slice(2)}`,
      toolName:
        part.type === "dynamic-tool" && "toolName" in part
          ? part.toolName
          : part.type,
      state: part.state,
      input: "input" in part ? part.input : undefined,
      output: "output" in part ? part.output : undefined,
      errorText: "errorText" in part ? part.errorText : undefined,
    }));
}

type WebSearchResult = {
  title: string;
  url: string;
  content: string;
  score: number;
  raw_content: string | null;
  favicon?: string;
};

type WebSearchOutput = {
  query: string;
  answer: string;
  images: string[];
  results: WebSearchResult[];
  response_time: string;
  auto_parameters: {
    topic: string;
    search_depth: string;
  };
};

function isWebSearchOutput(output: unknown): output is WebSearchOutput {
  if (!output || typeof output !== "object") return false;
  const obj = output as Record<string, unknown>;
  return (
    "query" in obj &&
    "answer" in obj &&
    "results" in obj &&
    Array.isArray(obj.results)
  );
}

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
    selectedProjectId,
    setSelectedProjectId,
    projects,
    availableModels,
  } = useChatContext();
  const { textInput } = usePromptInputController();
  const { preferences } = useViewer();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(thread?.title || "");

  const updateThreadTitle = useMutation(api.chat.updateThreadTitle);
  const softDeleteThread = useMutation(api.chat.softDeleteThread);
  const setThreadScope = useMutation(api.chat.setThreadScope);

  // Memoize uiMessages to ensure consistent hook order
  const uiMessages = useMemo(() => messages ?? [], [messages]);

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
      <div className="flex items-center justify-between px-2 py-1 border-b border-border/60 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
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
              const toolCalls =
                message.role === "assistant" ? getToolCalls(message) : [];
              const hasToolCalls = toolCalls.length > 0;

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
                        {hasToolCalls &&
                          preferences?.aiChatShowActions !== false && (
                            <>
                              <ChainOfThought defaultOpen={false}>
                                <EnhancedChainOfThoughtHeader
                                  totalSteps={toolCalls.length}
                                  providers={toolCalls
                                    .filter(
                                      (tc) =>
                                        tc.state === "output-available" ||
                                        tc.state === "output-error",
                                    )
                                    .map((tc) => detectProvider(tc.toolName))}
                                >
                                  Actions ({toolCalls.length})
                                </EnhancedChainOfThoughtHeader>
                                <ChainOfThoughtContent>
                                  {toolCalls.map((toolCall) => {
                                    const stateInfo = getToolStateInfo(
                                      toolCall.state,
                                    );
                                    const summary = getToolInputSummary(
                                      toolCall.input,
                                    );
                                    const displayName =
                                      toolCall.toolName.startsWith("tool-")
                                        ? getToolDisplayName({
                                          type: toolCall.toolName,
                                          state: toolCall.state,
                                        } as ToolUIPart)
                                        : getToolDisplayName({
                                          type: "dynamic-tool",
                                          toolName: toolCall.toolName,
                                          state: toolCall.state,
                                        } as DynamicToolUIPart);
                                    return (
                                      <ChainOfThoughtStep
                                        key={toolCall.id}
                                        label={displayName}
                                        description={
                                          summary ?? stateInfo.badgeLabel
                                        }
                                        status={stateInfo.stepStatus}
                                        toolName={toolCall.toolName}
                                      />
                                    );
                                  })}
                                </ChainOfThoughtContent>
                              </ChainOfThought>
                              {preferences?.aiChatShowToolDetails !== false &&
                                toolCalls.map((toolCall) => {
                                  return (
                                    <Tool key={toolCall.id}>
                                      <EnhancedToolHeader
                                        toolName={toolCall.toolName}
                                        state={toolCall.state}
                                      />
                                      <ToolContent>
                                        <div className="space-y-3 pt-2">
                                          <ToolSummaryBar
                                            summary={getToolSummary(toolCall)}
                                          />
                                          <ToolMetaPanel
                                            items={getToolMetaItems(toolCall)}
                                          />
                                          {renderToolContent(toolCall)}
                                        </div>
                                      </ToolContent>
                                    </Tool>
                                  );
                                })}
                            </>
                          )}
                        {hasReasoning &&
                          preferences?.aiChatShowReasoning !== false && (
                            <Reasoning
                              isStreaming={status === "streaming"}
                              defaultOpen={false}
                            >
                              <ReasoningTrigger />
                              <ReasoningContent>
                                {reasoningText}
                              </ReasoningContent>
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
      <div className="shrink-0 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-16 py-3 pb-[calc(env(safe-area-inset-bottom)+2px)]">
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
            <div className="flex items-center gap-2">
              {availableModels.length > 0 && (
                <ModelSelector>
                  <ModelSelectorTrigger className="h-7 text-[11px] px-2">
                    <ModelSelectorName>
                      {availableModels.find(
                        (m) => m.modelId === selectedModelId,
                      )?.name ?? "Select model"}
                    </ModelSelectorName>
                  </ModelSelectorTrigger>
                  <ModelSelectorContent>
                    <ModelSelectorInput placeholder="Search models..." />
                    <ModelSelectorList>
                      <ModelSelectorGroup heading="Available Models">
                        {availableModels.map((model) => (
                          <ModelSelectorItem
                            key={model.modelId}
                            value={model.modelId}
                            onSelect={() => setSelectedModelId(model.modelId)}
                          >
                            <ModelSelectorName>{model.name}</ModelSelectorName>
                          </ModelSelectorItem>
                        ))}
                      </ModelSelectorGroup>
                    </ModelSelectorList>
                  </ModelSelectorContent>
                </ModelSelector>
              )}
              {projects.length > 0 && (
                <ProjectSelector>
                  <ProjectSelectorTrigger className="h-7 text-[11px] px-2 flex items-center gap-1">
                    <span className="truncate max-w-[150px]">
                      {selectedProjectId
                        ? projects.find((p) => p._id === selectedProjectId)
                          ?.icon +
                        " " +
                        projects.find((p) => p._id === selectedProjectId)
                          ?.title || "Select project"
                        : "No project"}
                    </span>
                  </ProjectSelectorTrigger>
                  <ProjectSelectorContent>
                    <ProjectSelectorList>
                      <ProjectSelectorEmpty>
                        No projects found
                      </ProjectSelectorEmpty>
                      <ProjectSelectorGroup heading="Your Projects">
                        <ProjectSelectorItem
                          value="none"
                          onSelect={() => {
                            setSelectedProjectId(null);
                            if (thread) {
                              void setThreadScope({
                                threadId: thread.threadId,
                                scope: "workspace",
                              });
                            }
                          }}
                        >
                          No project
                        </ProjectSelectorItem>
                        {projects.map((project) => (
                          <ProjectSelectorItem
                            key={project._id}
                            value={project._id}
                            onSelect={() => {
                              setSelectedProjectId(project._id);
                              if (thread) {
                                void setThreadScope({
                                  threadId: thread.threadId,
                                  scope: "project",
                                  projectId: project._id,
                                });
                              }
                            }}
                          >
                            <span className="mr-2">{project.icon}</span>
                            {project.title}
                          </ProjectSelectorItem>
                        ))}
                      </ProjectSelectorGroup>
                    </ProjectSelectorList>
                  </ProjectSelectorContent>
                </ProjectSelector>
              )}
            </div>
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
