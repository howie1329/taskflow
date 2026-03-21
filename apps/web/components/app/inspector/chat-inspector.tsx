"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useMutation, useQuery } from "convex/react"
import { toast } from "sonner"
import {
  CheckCircle2Icon,
  CopyIcon,
  ExternalLinkIcon,
  LoaderCircleIcon,
  PlayIcon,
  RefreshCcwIcon,
  SaveIcon,
  ServerCogIcon,
  SquareIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from "lucide-react"
import { api } from "@/convex/_generated/api"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { extractSourcesFromMessages } from "@/lib/chat/extract-sources"
import {
  formatTimestamp,
  getContextHealthLabel,
  getContextHealthState,
  getContextUsageRatio,
  getLastAssistantInputTokens,
} from "@/lib/chat/thread-context"
import {
  buildThreadContextChips,
  buildThreadInspectorSummary,
} from "@/lib/chat/right-panel-view-model"
import {
  RightPanelChipRow,
  RightPanelCollapsibleSection,
  RightPanelEmptyState,
  RightPanelList,
  RightPanelListRow,
  RightPanelScrollBody,
  RightPanelSection,
  RightPanelShell,
  RightPanelSummaryBar,
} from "@/components/app/right-panel-primitives"
import {
  EMPTY_DAYTONA_STATUS,
  type DaytonaStatus,
  type DaytonaStatusPayload,
} from "@/lib/daytona/state"

type ChatInspectorProps = {
  threadId?: string
}

type ToolCallSummary = {
  toolKey: string
  count: number
}

type MessageLike = {
  role: string
  content: unknown
  messageId?: string
}

function getAssistantToolKeys(messages: MessageLike[]) {
  const counts = new Map<string, number>()
  for (const message of messages) {
    const content = message.content
    if (!Array.isArray(content)) continue
    for (const part of content) {
      if (!part || typeof part !== "object") continue
      const type = (part as { type?: unknown }).type
      if (typeof type !== "string") continue
      if (!type.startsWith("tool-") && type !== "dynamic-tool") continue
      const key =
        type === "dynamic-tool"
          ? String((part as { toolName?: unknown }).toolName ?? "dynamic-tool")
          : type.replace(/^tool-/, "")
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }

  return Array.from(counts.entries())
    .map(([toolKey, count]) => ({ toolKey, count }))
    .sort((left, right) => right.count - left.count)
}

async function copyText(value: string, successMessage: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.success(successMessage)
  } catch {
    toast.error("Failed to copy")
  }
}

function getDaytonaStatusLabel(status: DaytonaStatus) {
  switch (status) {
    case "provisioning":
      return "Provisioning"
    case "ready":
      return "Ready"
    case "stopped":
      return "Stopped"
    case "failed":
      return "Failed"
    default:
      return "Not started"
  }
}

function getDaytonaAcknowledgeText(daytona: DaytonaStatusPayload) {
  if (daytona.status === "ready") {
    return "Daytona instance created and repository clone completed."
  }

  if (daytona.status === "stopped") {
    return "Daytona instance is stopped and still attached to this thread."
  }

  if (daytona.status === "failed") {
    return daytona.errorMessage ?? "Daytona setup failed."
  }

  if (daytona.status === "provisioning") {
    return "Daytona is provisioning this thread's sandbox."
  }

  return "No Daytona instance has been created for this thread yet."
}

export function ChatInspector({ threadId }: ChatInspectorProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [memoryDraft, setMemoryDraft] = useState("")
  const [isSavingMemory, setIsSavingMemory] = useState(false)
  const [repoDraft, setRepoDraft] = useState("")
  const [daytonaAction, setDaytonaAction] = useState<
    null | "spin-up" | "status" | "start" | "stop" | "delete"
  >(null)
  const threads = useQuery(api.chat.listThreads, {}) ?? []
  const bootstrap = useQuery(api.chat.getChatBootstrap)
  const saveThreadSummary = useMutation(api.chat.setThreadSummary)
  const thread = useQuery(api.chat.getThread, threadId ? { threadId } : "skip")
  const daytonaStatus =
    useQuery(
      api.chat.getThreadDaytonaStatus,
      threadId ? { threadId } : "skip",
    ) ?? EMPTY_DAYTONA_STATUS
  const messagesQuery = useQuery(
    api.chat.listMessages,
    threadId ? { threadId } : "skip",
  )
  const project = useQuery(
    api.projects.getMyProject,
    thread?.projectId ? { projectId: thread.projectId } : "skip",
  )

  const messages = useMemo(() => messagesQuery ?? [], [messagesQuery])
  const toolSummary = useMemo<ToolCallSummary[]>(
    () => getAssistantToolKeys(messages),
    [messages],
  )
  const assistantCount = useMemo(
    () => messages.filter((message) => message.role === "assistant").length,
    [messages],
  )
  const defaultModel = bootstrap?.preferences?.defaultAIModel?.modelId ?? null
  const activeModel = thread?.model ?? defaultModel
  const activeModelDetails = useMemo(
    () =>
      bootstrap?.availableModels?.find((model) => model.modelId === activeModel) ??
      null,
    [bootstrap?.availableModels, activeModel],
  )
  const sources = useMemo(() => extractSourcesFromMessages(messages), [messages])
  const usageTotals = thread?.usageTotals
  const lastPromptTokens = getLastAssistantInputTokens(messages)
  const contextUsageRatio = getContextUsageRatio({
    totalTokens: lastPromptTokens,
    contextLength: activeModelDetails?.contextLength,
  })
  const contextHealthState = getContextHealthState(contextUsageRatio)
  const contextHealthLabel = getContextHealthLabel(contextHealthState)

  useEffect(() => {
    setMemoryDraft(thread?.summary?.summaryText ?? "")
  }, [thread?.threadId, thread?.summary?.summaryText])

  useEffect(() => {
    setRepoDraft(daytonaStatus.repoUrl ?? "")
  }, [thread?.threadId, daytonaStatus.repoUrl])

  if (!threadId) {
    return (
      <RightPanelShell>
        <RightPanelScrollBody className="pt-1">
          <RightPanelSummaryBar
            eyebrow="Inspector"
            title="Choose a thread"
            description="Thread-level context, evidence, tool activity, and memory will appear here."
          />

          <RightPanelSection
            title="Recent threads"
            description="Jump back into a conversation to inspect its context and evidence."
          >
            {threads.length === 0 ? (
              <RightPanelEmptyState
                title="No threads yet"
                description="Start a conversation to populate the inspector."
              />
            ) : (
              <RightPanelList>
                {threads.slice(0, 6).map((item) => (
                  <RightPanelListRow key={item.threadId} className="px-0 py-0">
                    <Link
                      href={`/app/chat/${item.threadId}`}
                      className="block px-4 py-3 text-sm transition-colors hover:bg-muted/20"
                    >
                      <div className="font-medium text-foreground">
                        {item.title || "Untitled chat"}
                      </div>
                    </Link>
                  </RightPanelListRow>
                ))}
              </RightPanelList>
            )}
          </RightPanelSection>
        </RightPanelScrollBody>
      </RightPanelShell>
    )
  }

  if (thread === undefined) {
    return (
      <RightPanelShell>
        <RightPanelScrollBody className="pt-1">
          <RightPanelSummaryBar
            eyebrow="Inspector"
            title="Loading thread"
            description="Gathering context, sources, and memory."
          />
        </RightPanelScrollBody>
      </RightPanelShell>
    )
  }

  if (!thread) {
    return (
      <RightPanelShell>
        <RightPanelScrollBody className="pt-1">
          <RightPanelSummaryBar
            eyebrow="Inspector"
            title="Thread not found"
            description="This conversation may have been removed."
          />
        </RightPanelScrollBody>
      </RightPanelShell>
    )
  }

  const summaryText = thread.summary?.summaryText ?? ""
  const hasSummary = Boolean(summaryText)
  const hasUnsavedMemoryChanges = memoryDraft !== summaryText
  const hasDaytonaInstance = daytonaStatus.exists
  const isDaytonaBusy = daytonaAction !== null
  const daytonaSpinUpBlocked = hasDaytonaInstance || isDaytonaBusy
  const scopeLabel =
    thread.scope === "project" && project ? project.title : "Workspace"
  const inspectorSummary = buildThreadInspectorSummary({
    scopeLabel,
    assistantCount,
    messageCount: messages.length,
    updatedAt: thread.updatedAt,
    sourceCount: sources.length,
    hasSummary,
  })
  const contextChips = buildThreadContextChips({
    activeModel,
    contextLabel: activeModelDetails?.contextLength
      ? `${lastPromptTokens ?? "—"} / ${activeModelDetails.contextLength}`
      : String(lastPromptTokens ?? "—"),
    contextHealthLabel,
    costUsdMicros: usageTotals?.totalCostUsdMicros,
  })

  const handleCopySources = async () => {
    await copyText(
      sources.map((source) => source.url).join("\n"),
      "Sources copied",
    )
  }

  const handleCopyMemory = async () => {
    if (!summaryText) return
    await copyText(summaryText, "Thread memory copied")
  }

  const handleSaveMemory = async () => {
    if (!thread.summary?.summarizedThroughMessageId) return

    const nextSummary = memoryDraft.trim()
    if (!nextSummary) {
      toast.error("Summary cannot be empty")
      return
    }

    setIsSavingMemory(true)
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
      })
      toast.success("Thread memory updated")
    } catch (error) {
      toast.error("Failed to update thread memory")
      console.error("Failed to save thread memory:", error)
    } finally {
      setIsSavingMemory(false)
    }
  }

  const runDaytonaAction = async ({
    action,
    endpoint,
    body,
    successMessage,
  }: {
    action: NonNullable<typeof daytonaAction>
    endpoint: string
    body: Record<string, string>
    successMessage: string
  }) => {
    setDaytonaAction(action)
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(payload.error ?? "Daytona request failed")
      }

      toast.success(successMessage)
      setActiveTab("daytona")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Daytona request failed",
      )
    } finally {
      setDaytonaAction(null)
    }
  }

  const handleSpinUpDaytona = async () => {
    const repoUrl = repoDraft.trim()
    if (!threadId || !repoUrl || daytonaSpinUpBlocked) {
      return
    }

    await runDaytonaAction({
      action: "spin-up",
      endpoint: "/api/daytona/spin-up",
      body: { threadId, repoUrl },
      successMessage: "Daytona instance created successfully",
    })
  }

  const handleRefreshDaytonaStatus = async () => {
    if (!threadId || !daytonaStatus.sandboxId || isDaytonaBusy) return

    await runDaytonaAction({
      action: "status",
      endpoint: "/api/daytona/status",
      body: { threadId },
      successMessage: "Daytona status refreshed",
    })
  }

  const handleStopDaytona = async () => {
    if (
      !threadId ||
      !daytonaStatus.sandboxId ||
      daytonaStatus.status === "stopped" ||
      isDaytonaBusy
    ) {
      return
    }

    await runDaytonaAction({
      action: "stop",
      endpoint: "/api/daytona/stop",
      body: { threadId },
      successMessage: "Daytona instance stopped",
    })
  }

  const handleStartDaytona = async () => {
    if (
      !threadId ||
      !daytonaStatus.sandboxId ||
      daytonaStatus.status !== "stopped" ||
      isDaytonaBusy
    ) {
      return
    }

    await runDaytonaAction({
      action: "start",
      endpoint: "/api/daytona/start",
      body: { threadId },
      successMessage: "Daytona instance started",
    })
  }

  const handleDeleteDaytona = async () => {
    if (!threadId || !daytonaStatus.sandboxId || isDaytonaBusy) return
    if (!window.confirm("Delete this Daytona instance from the thread?")) {
      return
    }

    await runDaytonaAction({
      action: "delete",
      endpoint: "/api/daytona/delete",
      body: { threadId },
      successMessage: "Daytona instance deleted",
    })
  }

  return (
    <RightPanelShell>
      <RightPanelScrollBody className="pt-1">
        <RightPanelSummaryBar
          eyebrow="Summary"
          title={inspectorSummary.status}
          description={thread.title || "Untitled chat"}
        />

        <RightPanelChipRow chips={inspectorSummary.chips.map((chip) => chip.label)} />
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-3"
        >
          <TabsList
            variant="line"
            className="h-8 w-full justify-start gap-4 overflow-x-auto bg-transparent p-0"
          >
            <TabsTrigger
              value="overview"
              className="h-8 rounded-none px-0 py-0 text-sm font-medium"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="sources"
              className="h-8 rounded-none px-0 py-0 text-sm font-medium"
            >
              Sources
            </TabsTrigger>
            <TabsTrigger
              value="memory"
              className="h-8 rounded-none px-0 py-0 text-sm font-medium"
            >
              Memory
            </TabsTrigger>
            <TabsTrigger
              value="daytona"
              className="h-8 rounded-none px-0 py-0 text-sm font-medium"
            >
              Daytona
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0 space-y-3">
            <RightPanelSection
              title="Context"
              description="Model, scope, usage, and compaction health for this thread."
            >
              <div className="space-y-3">
                <RightPanelChipRow chips={contextChips} />
                <RightPanelList>
                  <RightPanelListRow>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-muted-foreground">Scope</span>
                      <span className="font-medium text-foreground">{scopeLabel}</span>
                    </div>
                  </RightPanelListRow>
                  <RightPanelListRow>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-muted-foreground">Updated</span>
                      <span className="font-medium text-foreground">
                        {formatTimestamp(thread.updatedAt)}
                      </span>
                    </div>
                  </RightPanelListRow>
                  <RightPanelListRow>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-muted-foreground">Context health</span>
                      <span className="font-medium text-foreground">
                        {contextHealthLabel}
                      </span>
                    </div>
                  </RightPanelListRow>
                  {project ? (
                    <RightPanelListRow>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">Project</span>
                        <span className="font-medium text-foreground">
                          {project.title}
                        </span>
                      </div>
                    </RightPanelListRow>
                  ) : null}
                </RightPanelList>
              </div>
            </RightPanelSection>

            <RightPanelCollapsibleSection
              title="Tool Activity"
              description="Every tool used by assistant messages in this thread."
              defaultOpen={toolSummary.length > 0}
            >
              {toolSummary.length === 0 ? (
                <RightPanelEmptyState
                  title="No tool calls yet"
                  description="Tool usage will appear here once the assistant invokes actions."
                />
              ) : (
                <RightPanelList>
                  {toolSummary.map((tool) => (
                    <RightPanelListRow key={tool.toolKey}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-foreground">
                          {tool.toolKey}
                        </span>
                        <RightPanelChipRow chips={[`${tool.count} calls`]} />
                      </div>
                    </RightPanelListRow>
                  ))}
                </RightPanelList>
              )}
            </RightPanelCollapsibleSection>
          </TabsContent>

          <TabsContent value="sources" className="mt-0">
            <RightPanelCollapsibleSection
              title="Sources"
              description="Evidence gathered from search and tool execution."
              defaultOpen
              actions={
                sources.length > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopySources}
                  >
                    <CopyIcon className="size-3.5" />
                    Copy all
                  </Button>
                ) : null
              }
            >
              {sources.length === 0 ? (
                <RightPanelEmptyState
                  title="No evidence yet"
                  description="No web or evidence sources have been captured in this thread."
                />
              ) : (
                <RightPanelList>
                  {sources.map((source) => (
                    <RightPanelListRow key={source.url}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium leading-6 text-foreground">
                              {source.title ?? source.domain}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {source.domain}
                            </p>
                          </div>
                          <ExternalLinkIcon className="mt-1 size-4 shrink-0 text-muted-foreground" />
                        </div>
                        <RightPanelChipRow
                          chips={[
                            source.toolKey,
                            source.messageId
                              ? `msg ${source.messageId.slice(0, 8)}`
                              : null,
                          ]}
                        />
                      </a>
                    </RightPanelListRow>
                  ))}
                </RightPanelList>
              )}
            </RightPanelCollapsibleSection>
          </TabsContent>

          <TabsContent value="memory" className="mt-0">
            <RightPanelCollapsibleSection
              title="Memory"
              description="Rolling summary used to compact older context for the current thread."
              defaultOpen={hasSummary}
              actions={
                hasSummary ? (
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
                ) : null
              }
            >
              {hasSummary ? (
                <div className="space-y-3">
                  <Textarea
                    value={memoryDraft}
                    onChange={(event) => setMemoryDraft(event.target.value)}
                    maxLength={2000}
                    className="min-h-40 resize-y rounded-md border-border bg-background text-sm"
                    placeholder="Thread memory summary"
                  />
                  <RightPanelChipRow
                    chips={[
                      `${memoryDraft.length}/2000 chars`,
                      thread.summary?.updatedAt
                        ? `updated ${formatTimestamp(thread.summary.updatedAt)}`
                        : null,
                    ]}
                  />
                  <div className="rounded-lg border border-border bg-muted/15 px-3 py-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle2Icon className="size-3.5" />
                      <span>
                        Edit the stored summary directly when you need tighter memory
                        for later turns.
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <RightPanelEmptyState
                  title="No rolling summary yet"
                  description="Summaries are created when the conversation exceeds compaction thresholds or when you use Compact chat."
                />
              )}
            </RightPanelCollapsibleSection>
          </TabsContent>

          <TabsContent value="daytona" className="mt-0 space-y-3">
            <RightPanelSection
              title="Daytona"
              description="Create one Daytona sandbox for this thread by cloning a public GitHub repository."
            >
              <div className="space-y-3">
                <div className="space-y-2">
                  <label
                    htmlFor="daytona-repo-url"
                    className="text-sm font-medium text-foreground"
                  >
                    Repository URL
                  </label>
                  <Input
                    id="daytona-repo-url"
                    type="url"
                    placeholder="https://github.com/owner/repo"
                    value={repoDraft}
                    onChange={(event) => setRepoDraft(event.target.value)}
                    disabled={hasDaytonaInstance || isDaytonaBusy}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    onClick={handleSpinUpDaytona}
                    disabled={!repoDraft.trim() || daytonaSpinUpBlocked}
                    className="col-span-2"
                  >
                    {daytonaAction === "spin-up" ? (
                      <>
                        <LoaderCircleIcon className="size-4 animate-spin" />
                        Spinning up instance
                      </>
                    ) : (
                      <>
                        <ServerCogIcon className="size-4" />
                        Spin up instance
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRefreshDaytonaStatus}
                    disabled={!daytonaStatus.sandboxId || isDaytonaBusy}
                  >
                    {daytonaAction === "status" ? (
                      <LoaderCircleIcon className="size-4 animate-spin" />
                    ) : (
                      <RefreshCcwIcon className="size-4" />
                    )}
                    Get status
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={
                      daytonaStatus.status === "stopped"
                        ? handleStartDaytona
                        : handleStopDaytona
                    }
                    disabled={
                      !daytonaStatus.sandboxId ||
                      isDaytonaBusy
                    }
                  >
                    {daytonaAction === "stop" || daytonaAction === "start" ? (
                      <LoaderCircleIcon className="size-4 animate-spin" />
                    ) : daytonaStatus.status === "stopped" ? (
                      <PlayIcon className="size-4" />
                    ) : (
                      <SquareIcon className="size-4" />
                    )}
                    {daytonaStatus.status === "stopped"
                      ? "Start instance"
                      : "Stop instance"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDeleteDaytona}
                    disabled={!daytonaStatus.sandboxId || isDaytonaBusy}
                    className="col-span-2"
                  >
                    {daytonaAction === "delete" ? (
                      <LoaderCircleIcon className="size-4 animate-spin" />
                    ) : (
                      <Trash2Icon className="size-4" />
                    )}
                    Delete instance
                  </Button>
                </div>

                {hasDaytonaInstance ? (
                  <div className="rounded-lg border border-border bg-muted/15 px-3 py-2 text-xs text-muted-foreground">
                    This thread already has a Daytona instance attached. Delete it to spin up a fresh one.
                  </div>
                ) : null}
              </div>
            </RightPanelSection>

            <RightPanelSection
              title="Status"
              description="Basic Daytona status for the current thread."
            >
              <div className="space-y-3">
                <RightPanelChipRow
                  chips={[
                    getDaytonaStatusLabel(daytonaStatus.status),
                    daytonaStatus.cloneStatus.replace(/_/g, " "),
                  ]}
                />

                <RightPanelList>
                  <RightPanelListRow>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-muted-foreground">Repository</span>
                      <span className="max-w-[14rem] truncate font-medium text-foreground">
                        {daytonaStatus.repoUrl ?? "—"}
                      </span>
                    </div>
                  </RightPanelListRow>
                  <RightPanelListRow>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-muted-foreground">Sandbox</span>
                      <span className="font-medium text-foreground">
                        {daytonaStatus.sandboxId ?? "—"}
                      </span>
                    </div>
                  </RightPanelListRow>
                  <RightPanelListRow>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-muted-foreground">Last updated</span>
                      <span className="font-medium text-foreground">
                        {daytonaStatus.updatedAt
                          ? formatTimestamp(daytonaStatus.updatedAt)
                          : "—"}
                      </span>
                    </div>
                  </RightPanelListRow>
                </RightPanelList>

                <Alert variant={daytonaStatus.status === "failed" ? "destructive" : "default"}>
                  {daytonaStatus.status === "failed" ? (
                    <TriangleAlertIcon className="size-4" />
                  ) : (
                    <CheckCircle2Icon className="size-4" />
                  )}
                  <AlertTitle>Acknowledgment</AlertTitle>
                  <AlertDescription>
                    {getDaytonaAcknowledgeText(daytonaStatus)}
                  </AlertDescription>
                </Alert>
              </div>
            </RightPanelSection>
          </TabsContent>
        </Tabs>
      </RightPanelScrollBody>
    </RightPanelShell>
  )
}
