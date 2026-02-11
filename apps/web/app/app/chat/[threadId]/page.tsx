"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  ModeSelector,
  ModeSelectorTrigger,
  ModeSelectorContent,
  ModeSelectorInput,
  ModeSelectorList,
  ModeSelectorItem,
  ModeSelectorGroup,
  ModeSelectorName,
  ModeSelectorDescription,
} from "@/components/ai-elements/mode-selector";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
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
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
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
import { ChevronDownIcon, CopyIcon, RefreshCwIcon, ActivityIcon } from "lucide-react";
import type { UIMessage, ToolUIPart, DynamicToolUIPart } from "ai";
import {
  isTavilyWebSearchOutput,
  normalizeTavilyOutput,
} from "@/lib/AITools/Tavily/types";
import { TavilyWebSearchCard } from "@/components/ai-elements/tavily-web-search-card";
import { ExaWebSearchCard } from "@/components/ai-elements/exa-web-search-card";
import { ExaAnswerCard } from "@/components/ai-elements/exa-answer-card";
import { FirecrawlSearchCard } from "@/components/ai-elements/firecrawl-search-card";
import { FirecrawlScrapeCard } from "@/components/ai-elements/firecrawl-scrape-card";
import { ParallelWebSearchCard } from "@/components/ai-elements/parallel-web-search-card";
import { ValyuWebSearchCard } from "@/components/ai-elements/valyu-web-search-card";
import { ValyuFinanceSearchCard } from "@/components/ai-elements/valyu-finance-search-card";
import { TaskflowToolResultCard } from "@/components/ai-elements/taskflow-tool-result-card";
import { ModernToolResult } from "@/components/ai-elements/modern-tool-result";
import { useChatContext } from "../components/chat-provider";
import { useViewer } from "@/components/settings/hooks/use-viewer";
import { AVAILABLE_MODES, getModeDescription } from "@/lib/AITools/ModePrompts";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TASKFLOW_TOOL_KEYS } from "@/lib/AITools/taskflow-tool-keys";

import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";
import { mermaid } from "@streamdown/mermaid";
import { math } from "@streamdown/math";
import { cjk } from "@streamdown/cjk";
import "streamdown/styles.css";
import "katex/dist/katex.min.css"
type ToolCall = {
  id: string;
  toolKey: string;
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

function getToolDisplayNameFromKey(toolKey: string): string {
  if (toolKey === "webSearch") return "Web search";
  return toolKey
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

function getOutputArrayLength(output: unknown, key: string): number {
  if (!output || typeof output !== "object") return 0;
  const value = (output as Record<string, unknown>)[key];
  return Array.isArray(value) ? value.length : 0;
}

function getToolSummary(toolCall: ToolCall): string | null {
  if (toolCall.toolKey === "tavilyWebSearch" && isTavilyWebSearchOutput(toolCall.output)) {
    const output = normalizeTavilyOutput(
      toolCall.output as unknown as Record<string, unknown>,
    );
    return `Found ${output.results.length} sources`;
  }

  if (toolCall.toolKey === "exaWebSearch") {
    const resultCount = getOutputArrayLength(toolCall.output, "results");
    return `Found ${resultCount} Exa results`;
  }

  if (toolCall.toolKey === "exaAnswer") {
    return "Generated answer with citations";
  }

  if (toolCall.toolKey === "firecrawlSearch") {
    const resultCount = getOutputArrayLength(toolCall.output, "data");
    return `Found ${resultCount} pages`;
  }

  if (toolCall.toolKey === "firecrawlScrape") {
    return "Scraped page content";
  }

  if (toolCall.toolKey === "parallelWebSearch") {
    const resultCount = getOutputArrayLength(toolCall.output, "results");
    return `Found ${resultCount} aggregated results`;
  }

  if (toolCall.toolKey === "advancedResearch") {
    const resultCount = getOutputArrayLength(toolCall.output, "sources");
    return `Compiled ${resultCount} multi-source results`;
  }

  if (toolCall.toolKey === "valyuWebSearch" || toolCall.toolKey === "valyuFinanceSearch") {
    const resultCount = getOutputArrayLength(toolCall.output, "results");
    return `Found ${resultCount} Valyu results`;
  }

  if (TASKFLOW_TOOL_KEYS.includes(toolCall.toolKey as (typeof TASKFLOW_TOOL_KEYS)[number])) {
    if (toolCall.toolKey.startsWith("create")) return "Created successfully";
    if (toolCall.toolKey.startsWith("update")) return "Updated successfully";
    if (toolCall.toolKey.startsWith("delete")) return "Deleted successfully";
    if (toolCall.toolKey.startsWith("list")) return "Listed records";
    if (toolCall.toolKey.startsWith("get")) return "Fetched record";
  }

  if (toolCall.toolKey === "webSearch" && isWebSearchOutput(toolCall.output)) {
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
  const providerType = detectProvider(toolCall.toolKey);
  const providerName = providerConfig[providerType]?.name ?? "Unknown";

  const items = [
    { label: "Provider", value: providerName },
    { label: "Tool", value: toolCall.toolKey },
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

  switch (toolCall.toolKey) {
    case "tavilyWebSearch":
      if (isTavilyWebSearchOutput(toolCall.output)) {
        const output = normalizeTavilyOutput(
          toolCall.output as unknown as Record<string, unknown>,
        );
        return <TavilyWebSearchCard {...output} />;
      }
      break;
    case "exaWebSearch":
      return <ExaWebSearchCard output={toolCall.output} />;
    case "exaAnswer":
      return <ExaAnswerCard output={toolCall.output} />;
    case "firecrawlSearch":
      return <FirecrawlSearchCard output={toolCall.output} />;
    case "firecrawlScrape":
      return <FirecrawlScrapeCard output={toolCall.output} />;
    case "parallelWebSearch":
      return <ParallelWebSearchCard output={toolCall.output} />;
    case "advancedResearch":
      return (
        <p className="text-sm text-muted-foreground">
          Advanced research completed. Open enhanced details below for full source and scrape output.
        </p>
      );
    case "valyuWebSearch":
      return <ValyuWebSearchCard output={toolCall.output} />;
    case "valyuFinanceSearch":
      return <ValyuFinanceSearchCard output={toolCall.output} />;
    default:
      if (TASKFLOW_TOOL_KEYS.includes(toolCall.toolKey as (typeof TASKFLOW_TOOL_KEYS)[number])) {
        return (
          <TaskflowToolResultCard
            toolKey={toolCall.toolKey}
            input={toolCall.input}
            output={toolCall.output}
          />
        );
      }
  }

  if (toolCall.toolKey === "webSearch" && isWebSearchOutput(toolCall.output)) {
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
    .map((part) => {
      const rawToolName =
        part.type === "dynamic-tool" && "toolName" in part
          ? part.toolName
          : part.type;

      return {
        id: part.toolCallId ?? `tool-${Math.random().toString(36).slice(2)}`,
        toolKey: rawToolName.replace(/^tool-/, ""),
        state: part.state,
        input: "input" in part ? part.input : undefined,
        output: "output" in part ? part.output : undefined,
        errorText: "errorText" in part ? part.errorText : undefined,
      };
    });
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
    error,
    thread,
    project,
    selectedModelId,
    setSelectedModelId,
    selectedProjectId,
    setSelectedProjectId,
    selectedMode,
    setSelectedMode,
    projects,
    availableModels,
  } = useChatContext();
  const { textInput } = usePromptInputController();
  const { preferences } = useViewer();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(thread?.title || "");

  const [messageDetailsId, setMessageDetailsId] = useState<string | null>(null);
  const [clearedErrorMessage, setClearedErrorMessage] = useState<string | null>(null);

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

  const estimateTokens = (text: string) => Math.max(1, Math.ceil(text.length / 4));

  const getMessageLengthLabel = (text: string) => {
    const wordCount = text.trim().length ? text.trim().split(/\s+/).length : 0;
    return `${wordCount} words · ${text.length} chars`;
  };

  const regenerateAssistantResponse = async (assistantMessageId: string) => {
    const assistantIndex = uiMessages.findIndex((message) => message.id === assistantMessageId);
    if (assistantIndex < 0) return;

    const previousUser = [...uiMessages.slice(0, assistantIndex)]
      .reverse()
      .find((message) => message.role === "user");

    if (!previousUser) return;

    const previousText = renderMessageText(previousUser);
    if (!previousText.trim()) return;

    await sendText(previousText);
  };

  const copyAssistantMessage = async (messageText: string) => {
    try {
      await navigator.clipboard.writeText(messageText);
    } catch (copyError) {
      console.error("Failed to copy assistant message", copyError);
    }
  };

  const selectedMessage = uiMessages.find((message) => message.id === messageDetailsId);
  const selectedMessageText = selectedMessage ? renderMessageText(selectedMessage) : "";

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

      {error && error.message !== clearedErrorMessage && (
        <div className="px-4 py-3">
          <Alert variant="destructive" className="flex items-start justify-between gap-3">
            <div>
              <AlertTitle>Chat request failed</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setClearedErrorMessage(error.message)}>
              Clear error
            </Button>
          </Alert>
        </div>
      )}

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
            uiMessages.map((message, index) => {
              const reasoningText = renderMessageReasoning(message);
              const hasReasoning = !!reasoningText;
              const toolCalls =
                message.role === "assistant" ? getToolCalls(message) : [];
              const hasToolCalls = toolCalls.length > 0;
              const messageText = renderMessageText(message);
              const isStreamingMessage =
                message.role === "assistant" &&
                status === "streaming" &&
                index === uiMessages.length - 1;

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
                      "border border-border/60 bg-muted/40 px-2 py-2 max-w-[32rem] rounded-md",
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
                                    .map((tc) => detectProvider(tc.toolKey))}
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
                                      getToolDisplayNameFromKey(
                                        toolCall.toolKey,
                                      );
                                    return (
                                      <ChainOfThoughtStep
                                        key={toolCall.id}
                                        label={displayName}
                                        description={
                                          summary ?? stateInfo.badgeLabel
                                        }
                                        status={stateInfo.stepStatus}
                                        toolName={toolCall.toolKey}
                                      />
                                    );
                                  })}
                                </ChainOfThoughtContent>
                              </ChainOfThought>
                              {preferences?.aiChatShowToolDetails !== false && (
                                <>
                                  {toolCalls.length > 2 ? (
                                    <Collapsible defaultOpen={false}>
                                      <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 text-sm text-muted-foreground hover:text-foreground border rounded-lg">
                                        <ChevronDownIcon className="size-4 transition-transform group-data-[state=open]:rotate-180" />
                                        <span>
                                          {toolCalls.length} tool calls
                                        </span>
                                      </CollapsibleTrigger>
                                      <CollapsibleContent>
                                        {toolCalls.map((toolCall) => (
                                          <Tool key={toolCall.id}>
                                            <EnhancedToolHeader
                                              toolName={toolCall.toolKey}
                                              state={toolCall.state}
                                            />
                                            <ToolContent>
                                              <div className="space-y-3 pt-2">
                                                <ToolSummaryBar
                                                  summary={getToolSummary(
                                                    toolCall,
                                                  )}
                                                />
                                                <ToolMetaPanel
                                                  items={getToolMetaItems(
                                                    toolCall,
                                                  )}
                                                />
                                                {renderToolContent(toolCall)}
                                              </div>
                                            </ToolContent>
                                          </Tool>
                                        ))}
                                      </CollapsibleContent>
                                    </Collapsible>
                                  ) : (
                                    toolCalls.map((toolCall) => (
                                      <Tool key={toolCall.id}>
                                        <EnhancedToolHeader
                                          toolName={toolCall.toolKey}
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
                                    ))
                                  )}
                                </>
                              )}
                            </>
                          )}

                        {hasToolCalls && (
                          <div className="space-y-2 rounded-lg border border-dashed border-border/60 p-3">
                            <p className="text-xs font-medium text-muted-foreground">
                              Enhanced tool results
                            </p>
                            {toolCalls.map((toolCall) => {
                              const providerType = detectProvider(toolCall.toolKey);
                              const providerName = providerConfig[providerType]?.name ?? "Unknown";
                              return (
                                <ModernToolResult
                                  key={`modern-${toolCall.id}`}
                                  toolName={toolCall.toolKey}
                                  toolState={toolCall.state}
                                  summary={getToolSummary(toolCall)}
                                  provider={providerName}
                                  input={toolCall.input}
                                  output={toolCall.output}
                                />
                              );
                            })}
                          </div>
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
                        <Streamdown plugins={{ code, mermaid, math, cjk }} isAnimating={status === "streaming"} animated>
                          {messageText}
                        </Streamdown>

                        {isStreamingMessage && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <ActivityIcon className="size-3.5 animate-pulse" />
                            Streaming response...
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => void regenerateAssistantResponse(message.id)}
                          >
                            <RefreshCwIcon className="mr-1 size-3.5" />
                            Regenerate
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => void copyAssistantMessage(messageText)}
                          >
                            <CopyIcon className="mr-1 size-3.5" />
                            Copy
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setMessageDetailsId(message.id)}
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm whitespace-pre-wrap">
                        <Streamdown plugins={{ code, mermaid, math, cjk }} isAnimating={status === "streaming"} animated>
                          {messageText}
                        </Streamdown>
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

      <Sheet open={!!messageDetailsId} onOpenChange={(open) => !open && setMessageDetailsId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Assistant message details</SheetTitle>
            <SheetDescription>Token and size metrics for this response.</SheetDescription>
          </SheetHeader>
          <div className="space-y-3 py-4">
            <div className="rounded-md border border-border/60 p-3">
              <p className="text-xs text-muted-foreground">Estimated tokens</p>
              <p className="text-lg font-semibold">{estimateTokens(selectedMessageText)}</p>
            </div>
            <div className="rounded-md border border-border/60 p-3">
              <p className="text-xs text-muted-foreground">Length</p>
              <p className="text-sm font-medium">{getMessageLengthLabel(selectedMessageText)}</p>
            </div>
            <div className="rounded-md border border-border/60 p-3">
              <p className="text-xs text-muted-foreground">Preview</p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{selectedMessageText || "No text in this message."}</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

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
              <ModeSelector>
                <ModeSelectorTrigger className="h-7 text-[11px] px-2">
                  <ModeSelectorName>{selectedMode}</ModeSelectorName>
                </ModeSelectorTrigger>
                <ModeSelectorContent>
                  <ModeSelectorInput placeholder="Search modes..." />
                  <ModeSelectorList>
                    <ModeSelectorGroup heading="Available Modes">
                      {AVAILABLE_MODES.map((mode) => (
                        <ModeSelectorItem
                          key={mode}
                          value={mode}
                          onSelect={() => setSelectedMode(mode)}
                        >
                          <div className="flex flex-col items-start">
                            <ModeSelectorName>{mode}</ModeSelectorName>
                            <ModeSelectorDescription>
                              {getModeDescription(mode)}
                            </ModeSelectorDescription>
                          </div>
                        </ModeSelectorItem>
                      ))}
                    </ModeSelectorGroup>
                  </ModeSelectorList>
                </ModeSelectorContent>
              </ModeSelector>
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
