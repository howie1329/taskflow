"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type ChatInspectorProps = {
  threadId?: string;
};

type ToolCallSummary = {
  toolKey: string;
  count: number;
};

function getAssistantToolKeys(messages: { content: unknown }[]) {
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

function formatTimestamp(value?: number) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export function ChatInspector({ threadId }: ChatInspectorProps) {
  const threads = useQuery(api.chat.listThreads, {}) ?? [];
  const bootstrap = useQuery(api.chat.getChatBootstrap);
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

  return (
    <div className="space-y-4">
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

      <Separator />

      <div className="space-y-1 text-sm">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Context
        </p>
        <p>Model: {activeModel ?? "Not set"}</p>
        <p>Total messages: {messages.length}</p>
        <p>Assistant replies: {assistantCount}</p>
        <p>Updated: {formatTimestamp(thread.updatedAt)}</p>
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
  );
}
