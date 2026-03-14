"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  CopyIcon,
  ExternalLinkIcon,
  SaveIcon,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { extractSourcesFromMessages } from "@/lib/chat/extract-sources";
import {
  formatTimestamp,
  formatTokenCount,
  formatUsdMicros,
  getContextUsageRatio,
} from "@/lib/chat/thread-context";

type ChatInspectorProps = {
  threadId?: string;
};

type ToolCallSummary = {
  toolKey: string;
  count: number;
};

type MessageLike = {
  role: string;
  content: unknown;
  messageId?: string;
};

function getAssistantToolKeys(messages: MessageLike[]) {
  const counts = new Map<string, number>();
  for (const message of messages) {
    const content = message.content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (!part || typeof part !== "object") continue;
      const type = (part as { type?: unknown }).type;
      if (typeof type !== "string") continue;
      if (!type.startsWith("tool-") && type !== "dynamic-tool") continue;
      const key =
        type === "dynamic-tool"
          ? String((part as { toolName?: unknown }).toolName ?? "dynamic-tool")
          : type.replace(/^tool-/, "");
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([toolKey, count]) => ({ toolKey, count }))
    .sort((left, right) => right.count - left.count);
}

async function copyText(value: string, successMessage: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(successMessage);
  } catch {
    toast.error("Failed to copy");
  }
}

export function ChatInspector({ threadId }: ChatInspectorProps) {
  const [activeTab, setActiveTab] = useState("context");
  const [memoryDraft, setMemoryDraft] = useState("");
  const [isSavingMemory, setIsSavingMemory] = useState(false);
  const threads = useQuery(api.chat.listThreads, {}) ?? [];
  const bootstrap = useQuery(api.chat.getChatBootstrap);
  const saveThreadSummary = useMutation(api.chat.setThreadSummary);
  const thread = useQuery(api.chat.getThread, threadId ? { threadId } : "skip");
  const messagesQuery = useQuery(
    api.chat.listMessages,
    threadId ? { threadId } : "skip",
  );
  const project = useQuery(
    api.projects.getMyProject,
    thread?.projectId ? { projectId: thread.projectId } : "skip",
  );

  const messages = useMemo(() => messagesQuery ?? [], [messagesQuery]);
  const toolSummary = useMemo<ToolCallSummary[]>(
    () => getAssistantToolKeys(messages),
    [messages],
  );
  const assistantCount = useMemo(
    () => messages.filter((message) => message.role === "assistant").length,
    [messages],
  );
  const defaultModel = bootstrap?.preferences?.defaultAIModel?.modelId ?? null;
  const activeModel = thread?.model ?? defaultModel;
  const activeModelDetails = useMemo(
    () =>
      bootstrap?.availableModels?.find((model) => model.modelId === activeModel) ??
      null,
    [bootstrap?.availableModels, activeModel],
  );
  const sources = useMemo(() => extractSourcesFromMessages(messages), [messages]);
  const usageTotals = thread?.usageTotals;
  const lastPromptTokens = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const message = messages[i];
      if (message.role !== "assistant") continue;
      if (typeof message.usage?.inputTokens === "number") {
        return message.usage.inputTokens;
      }
    }
    return undefined;
  }, [messages]);
  const contextUsageRatio = getContextUsageRatio({
    totalTokens: lastPromptTokens,
    contextLength: activeModelDetails?.contextLength,
  })

  useEffect(() => {
    setMemoryDraft(thread?.summary?.summaryText ?? "");
  }, [thread?.threadId, thread?.summary?.summaryText]);

  if (!threadId) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Select a chat thread to see context, model, and tool activity.
        </p>
        {threads.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Recent Threads
              </p>
              {threads.slice(0, 6).map((item) => (
                <Link
                  key={item.threadId}
                  href={`/app/chat/${item.threadId}`}
                  className="block rounded-md border border-border/50 px-3 py-2 text-sm hover:bg-muted/30"
                >
                  {item.title || "Untitled chat"}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  if (thread === undefined) {
    return <p className="text-sm text-muted-foreground">Loading inspector…</p>;
  }

  if (!thread) {
    return <p className="text-sm text-muted-foreground">Thread not found.</p>;
  }

  const summaryText = thread.summary?.summaryText ?? "";
  const hasSummary = Boolean(summaryText);
  const hasUnsavedMemoryChanges = memoryDraft !== summaryText;

  const handleCopySources = async () => {
    await copyText(
      sources.map((source) => source.url).join("\n"),
      "Sources copied",
    );
  };

  const handleCopyMemory = async () => {
    if (!summaryText) return;
    await copyText(summaryText, "Thread memory copied");
  };

  const handleSaveMemory = async () => {
    if (!thread.summary?.summarizedThroughMessageId) return;

    const nextSummary = memoryDraft.trim();
    if (!nextSummary) {
      toast.error("Summary cannot be empty");
      return;
    }

    setIsSavingMemory(true);
    try {
      await saveThreadSummary({
        threadId: thread.threadId,
        summary: {
          schemaVersion: 1,
          summaryText: nextSummary,
          summarizedThroughMessageId: thread.summary.summarizedThroughMessageId,
          updatedAt: Date.now(),
          threadState: thread.summary.threadState,
          compactionMetadata: thread.summary.compactionMetadata,
        },
      });
      toast.success("Thread memory updated");
    } catch (error) {
      toast.error("Failed to update thread memory");
      console.error("Failed to save thread memory:", error);
    } finally {
      setIsSavingMemory(false);
    }
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="flex h-full min-h-0 flex-col gap-3"
    >
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Thread
        </p>
        <p className="text-sm font-medium">{thread.title || "Untitled chat"}</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{thread.scope ?? "workspace"}</Badge>
          {project ? <Badge variant="outline">{project.title}</Badge> : null}
        </div>
      </div>

      <TabsList variant="line" className="w-full justify-start bg-transparent p-0">
        <TabsTrigger value="context" className="max-w-[120px] px-0 py-1 text-xs">
          Context
        </TabsTrigger>
        <TabsTrigger value="sources" className="max-w-[120px] px-0 py-1 text-xs">
          Sources
        </TabsTrigger>
        <TabsTrigger value="memory" className="max-w-[120px] px-0 py-1 text-xs">
          Memory
        </TabsTrigger>
      </TabsList>

      <TabsContent value="context" className="mt-0 min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-4 pb-1">
          <div className="space-y-1 text-sm">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Context
            </p>
            <p>Model: {activeModel ?? "Not set"}</p>
            <p>
              Scope:{" "}
              {thread.scope === "project" && project
                ? `Project - ${project.title}`
                : "Workspace"}
            </p>
            <p>Total messages: {messages.length}</p>
            <p>Assistant replies: {assistantCount}</p>
            <p>Updated: {formatTimestamp(thread.updatedAt)}</p>
          </div>

          <Separator />

          <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Rolling summary
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  What the thread remembers right now
                </p>
              </div>
              {hasSummary ? (
                <Badge variant="outline">
                  {thread.summary?.compactionMetadata?.lastCompactedAt
                    ? `Compacted ${formatTimestamp(thread.summary.compactionMetadata.lastCompactedAt)}`
                    : thread.summary?.updatedAt
                      ? `Updated ${formatTimestamp(thread.summary.updatedAt)}`
                      : "Available"}
                </Badge>
              ) : null}
            </div>
            {hasSummary ? (
              <Collapsible className="mt-3">
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full justify-between"
                  >
                    <span>View summary</span>
                    <ChevronDownIcon className="size-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3">
                  <p className="whitespace-pre-wrap rounded-md border border-border/50 bg-background px-3 py-2 text-sm text-foreground">
                    {summaryText}
                  </p>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                No compaction yet. A rolling summary appears when the conversation
                exceeds thresholds or when you use Compact chat.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Usage snapshot
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  Tokens and context pressure
                </p>
              </div>
              {activeModelDetails?.contextLength ? (
                <Badge variant="secondary">
                  {formatTokenCount(activeModelDetails.contextLength)} context
                </Badge>
              ) : null}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-md border border-border/60 bg-background px-2 py-2">
                <p className="text-muted-foreground">Last prompt tokens</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {formatTokenCount(lastPromptTokens)}
                </p>
              </div>
              <div className="rounded-md border border-border/60 bg-background px-2 py-2">
                <p className="text-muted-foreground">Lifetime input</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {formatTokenCount(usageTotals?.inputTokens)}
                </p>
              </div>
              <div className="rounded-md border border-border/60 bg-background px-2 py-2">
                <p className="text-muted-foreground">Lifetime output</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {formatTokenCount(usageTotals?.outputTokens)}
                </p>
              </div>
              <div className="rounded-md border border-border/60 bg-background px-2 py-2">
                <p className="text-muted-foreground">Lifetime total</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {formatTokenCount(usageTotals?.totalTokens)}
                </p>
              </div>
              <div className="rounded-md border border-border/60 bg-background px-2 py-2">
                <p className="text-muted-foreground">Estimated cost</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {formatUsdMicros(usageTotals?.totalCostUsdMicros)}
                </p>
              </div>
            </div>
            {activeModelDetails?.contextLength ? (
              <div className="mt-3 rounded-md border border-border/60 bg-background px-3 py-2">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-muted-foreground">Last prompt vs context</span>
                  <span className="font-medium text-foreground">
                    {formatTokenCount(lastPromptTokens)} /{" "}
                    {formatTokenCount(activeModelDetails.contextLength)}
                    {contextUsageRatio !== null ? ` (${contextUsageRatio}%)` : ""}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Tool Activity
            </p>
            {toolSummary.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tool calls yet.</p>
            ) : (
              toolSummary.map((tool) => (
                <div
                  key={tool.toolKey}
                  className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2 text-sm"
                >
                  <span>{tool.toolKey}</span>
                  <Badge variant="secondary">{tool.count}</Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="sources" className="mt-0 min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-4 pb-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Sources used in this thread
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Links gathered from web search and evidence tool calls.
              </p>
            </div>
            {sources.length > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopySources}
              >
                <CopyIcon className="size-3.5" />
                Copy all
              </Button>
            ) : null}
          </div>

          {sources.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-4">
              <p className="text-sm font-medium text-foreground">No evidence yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                No web search sources have been captured in this thread.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sources.map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border border-border/60 bg-background p-3 transition-colors hover:bg-muted/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {source.title ?? source.domain}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {source.domain}
                      </p>
                    </div>
                    <ExternalLinkIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline">{source.toolKey}</Badge>
                    <Badge variant="secondary">{source.messageId.slice(0, 8)}</Badge>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="memory" className="mt-0 min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-4 pb-1">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Thread memory
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              This edits the rolling summary used to compact older context for the
              current thread. Use Compact chat to compress when thresholds are exceeded.
            </p>
          </div>

          {hasSummary ? (
            <div className="space-y-3">
              <Textarea
                value={memoryDraft}
                onChange={(event) => setMemoryDraft(event.target.value)}
                maxLength={2000}
                className="min-h-48 resize-y"
                placeholder="Thread memory summary"
              />
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  {memoryDraft.length}/2000 characters
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyMemory}
                  >
                    <CopyIcon className="size-3.5" />
                    Copy
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSaveMemory}
                    disabled={
                      isSavingMemory ||
                      !hasUnsavedMemoryChanges ||
                      memoryDraft.trim().length === 0
                    }
                  >
                    {isSavingMemory ? (
                      <>Saving…</>
                    ) : (
                      <>
                        <SaveIcon className="size-3.5" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div className="rounded-md border border-border/50 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2Icon className="size-3.5" />
                  <span>
                    Last updated: {formatTimestamp(thread.summary?.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-4">
              <p className="text-sm font-medium text-foreground">
                No rolling summary yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Summaries are created when the conversation exceeds message/token
                thresholds or when you use Compact chat.
              </p>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
