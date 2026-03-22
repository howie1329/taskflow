"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import type { UIMessage } from "ai"
import { useMutation, useQuery } from "convex/react"
import { toast } from "sonner"
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  CopyIcon,
  ExternalLinkIcon,
  LoaderCircleIcon,
  PencilIcon,
  PlayIcon,
  RefreshCcwIcon,
  SaveIcon,
  ServerCogIcon,
  SquareIcon,
  Trash2Icon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"
import { api } from "@/convex/_generated/api"
import { useChatInspectorFocus, useChatInspectorFocusActions } from "@/components/app/chat-inspector-context"
import {
  RightPanelDossierHeader,
  RightPanelEmptyState,
  RightPanelMetaList,
  RightPanelMetaRow,
  RightPanelScrollBody,
  RightPanelSectionBlock,
  RightPanelShell,
  RightPanelSurface,
  RightPanelTagRow,
} from "@/components/app/right-panel-primitives"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
  buildEvidenceSummary,
  buildMessageDetailsViewModel,
  buildThreadDossierHeader,
  buildThreadFocusSummary,
  buildToolFocusViewModel,
} from "@/lib/chat/right-panel-view-model"
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
  usage?: {
    inputTokens: number
    outputTokens: number
    totalTokens?: number
  }
  costUsdMicros?: number
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

function toUiMessages(messages: MessageLike[]): UIMessage[] {
  return messages.map((message) => ({
    id: message.messageId ?? crypto.randomUUID(),
    role: message.role as UIMessage["role"],
    parts: Array.isArray(message.content) ? message.content : [],
    metadata: {
      usage: message.usage,
      costUsdMicros: message.costUsdMicros,
    },
  }))
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

function getDaytonaSignal(daytona: DaytonaStatusPayload) {
  if (daytona.status === "failed") return "Sandbox failed"
  if (daytona.status === "provisioning") return "Sandbox provisioning"
  if (daytona.status === "ready") return "Sandbox ready"
  if (daytona.status === "stopped") return "Sandbox stopped"
  return null
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

function InspectorCollapsible({
  title,
  defaultOpen = false,
  children,
  actions,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="group">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-foreground">
            <ChevronDownIcon className="size-4 text-muted-foreground transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] group-data-[state=open]:rotate-180" />
            <span>{title}</span>
          </CollapsibleTrigger>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
        <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out">
          {children}
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

function FocusToolOutput({ output }: { output: unknown }) {
  if (output === undefined) {
    return (
      <p className="text-sm leading-6 text-muted-foreground">
        No raw output was persisted for this tool.
      </p>
    )
  }

  return (
    <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs leading-5 text-muted-foreground">
      {JSON.stringify(output, null, 2)}
    </pre>
  )
}

export function ChatInspector({ threadId }: ChatInspectorProps) {
  const [activeTab, setActiveTab] = useState("focus")
  const [memoryDraft, setMemoryDraft] = useState("")
  const [isSavingMemory, setIsSavingMemory] = useState(false)
  const [isEditingMemory, setIsEditingMemory] = useState(false)
  const [repoDraft, setRepoDraft] = useState("")
  const [daytonaAction, setDaytonaAction] = useState<
    null | "spin-up" | "status" | "start" | "stop" | "delete"
  >(null)
  const focus = useChatInspectorFocus()
  const { clearInspectorFocus } = useChatInspectorFocusActions()

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

  const persistedMessages = useMemo(() => (messagesQuery ?? []) as MessageLike[], [messagesQuery])
  const uiMessages = useMemo(() => toUiMessages(persistedMessages), [persistedMessages])
  const toolSummary = useMemo<ToolCallSummary[]>(
    () => getAssistantToolKeys(persistedMessages),
    [persistedMessages],
  )
  const defaultModel = bootstrap?.preferences?.defaultAIModel?.modelId ?? null
  const activeModel = thread?.model ?? defaultModel
  const activeModelDetails = useMemo(
    () =>
      bootstrap?.availableModels?.find((model) => model.modelId === activeModel) ??
      null,
    [bootstrap?.availableModels, activeModel],
  )
  const sources = useMemo(() => extractSourcesFromMessages(persistedMessages), [persistedMessages])
  const usageTotals = thread?.usageTotals
  const lastPromptTokens = getLastAssistantInputTokens(persistedMessages)
  const contextUsageRatio = getContextUsageRatio({
    totalTokens: lastPromptTokens,
    contextLength: activeModelDetails?.contextLength,
  })
  const contextHealthLabel = getContextHealthLabel(getContextHealthState(contextUsageRatio))
  const contextLabel = activeModelDetails?.contextLength
    ? `${lastPromptTokens ?? "—"} / ${activeModelDetails.contextLength}`
    : String(lastPromptTokens ?? "—")

  const summaryText = thread?.summary?.summaryText ?? ""
  const hasSummary = Boolean(summaryText)
  const hasUnsavedMemoryChanges = memoryDraft !== summaryText
  const hasDaytonaInstance = daytonaStatus.exists
  const isDaytonaBusy = daytonaAction !== null
  const daytonaSpinUpBlocked = hasDaytonaInstance || isDaytonaBusy
  const scopeLabel =
    thread?.scope === "project" && project ? project.title : "Workspace"

  const headerModel = buildThreadDossierHeader({
    activeModel,
    contextHealthLabel,
    contextLabel,
    updatedAt: thread?.updatedAt,
    sourceCount: sources.length,
    daytonaSignal: getDaytonaSignal(daytonaStatus),
  })
  const evidenceModel = buildEvidenceSummary({ sources })
  const threadFocus = buildThreadFocusSummary({
    messages: uiMessages,
    summaryText,
  })

  const selectedMessage =
    focus?.messageId ? uiMessages.find((message) => message.id === focus.messageId) ?? null : null
  const selectedMessageView = buildMessageDetailsViewModel(selectedMessage)
  const selectedToolView =
    focus?.type === "tool"
      ? buildToolFocusViewModel({
          message: uiMessages.find((message) => message.id === focus.messageId) ?? null,
          toolCallId: focus.toolCallId,
        })
      : null

  useEffect(() => {
    setMemoryDraft(summaryText)
  }, [summaryText, thread?.threadId])

  useEffect(() => {
    setRepoDraft(daytonaStatus.repoUrl ?? "")
  }, [daytonaStatus.repoUrl, thread?.threadId])

  useEffect(() => {
    if (!focus) return
    if (focus.type === "message" && !selectedMessage) {
      clearInspectorFocus()
    }
    if (focus.type === "tool" && !selectedToolView) {
      clearInspectorFocus()
    }
  }, [focus, selectedMessage, selectedToolView, clearInspectorFocus])

  useEffect(() => {
    if (focus) {
      setActiveTab("focus")
    }
  }, [focus])

  if (!threadId) {
    return (
      <RightPanelShell>
        <RightPanelScrollBody className="pt-1">
          <RightPanelDossierHeader
            title="Choose a thread"
            description="Thread context, evidence, and operating details appear here once a conversation is selected."
            meta={<RightPanelTagRow tags={["AI chat dossier"]} />}
          />

          <RightPanelSectionBlock
            title="Recent threads"
            description="Jump back into a conversation to inspect its working context."
          >
            {threads.length === 0 ? (
              <RightPanelEmptyState
                title="No threads yet"
                description="Start a conversation to populate the dossier."
              />
            ) : (
              <RightPanelSurface className="px-0 py-0">
                <div className="divide-y divide-border/45">
                  {threads.slice(0, 6).map((item) => (
                    <Link
                      key={item.threadId}
                      href={`/app/chat/${item.threadId}`}
                      className="block px-4 py-3 text-sm transition-colors duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-muted/20"
                    >
                      <div className="font-medium text-foreground">
                        {item.title || "Untitled chat"}
                      </div>
                    </Link>
                  ))}
                </div>
              </RightPanelSurface>
            )}
          </RightPanelSectionBlock>
        </RightPanelScrollBody>
      </RightPanelShell>
    )
  }

  if (thread === undefined) {
    return (
      <RightPanelShell>
        <RightPanelScrollBody className="pt-1">
          <RightPanelDossierHeader
            title="Loading thread"
            description="Gathering context, evidence, and memory."
            meta={<RightPanelTagRow tags={["Inspector"]} />}
          />
        </RightPanelScrollBody>
      </RightPanelShell>
    )
  }

  if (!thread) {
    return (
      <RightPanelShell>
        <RightPanelScrollBody className="pt-1">
          <RightPanelDossierHeader
            title="Thread not found"
            description="This conversation may have been removed."
            meta={<RightPanelTagRow tags={["Inspector"]} />}
          />
        </RightPanelScrollBody>
      </RightPanelShell>
    )
  }

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
      setIsEditingMemory(false)
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
    if (!threadId || !repoUrl || daytonaSpinUpBlocked) return

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
    if (!window.confirm("Delete this Daytona instance from the thread?")) return

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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-4">
          <TabsList
            variant="line"
            className="sticky top-0 z-10 h-10 w-full justify-start gap-3 overflow-x-auto border-b border-border/50 bg-background/95 px-2 backdrop-blur supports-backdrop-filter:bg-background/88"
          >
            <TabsTrigger value="focus" className="h-9 flex-none rounded-none px-0 text-sm font-medium">
              Focus
            </TabsTrigger>
            <TabsTrigger value="evidence" className="h-9 flex-none rounded-none px-0 text-sm font-medium">
              Evidence
            </TabsTrigger>
            <TabsTrigger value="memory" className="h-9 flex-none rounded-none px-0 text-sm font-medium">
              Memory
            </TabsTrigger>
            <TabsTrigger value="operations" className="h-9 flex-none rounded-none px-0 text-sm font-medium">
              Operations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="focus" className="mt-0">
            <RightPanelDossierHeader
              className="border-b-0 pb-2"
              title={thread.title || "Untitled chat"}
              description={
                focus?.type === "tool"
                  ? "Selected tool in context."
                  : focus?.type === "message"
                    ? "Selected message in context."
                    : headerModel.status
              }
              actions={
                focus ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={clearInspectorFocus}
                  >
                    <XIcon className="size-3.5" />
                    Clear focus
                  </Button>
                ) : null
              }
              meta={
                <div className="space-y-3">
                  <RightPanelTagRow
                    tags={[
                      scopeLabel,
                      ...headerModel.tags,
                      usageTotals?.totalCostUsdMicros !== undefined
                        ? `Cost ${Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                            minimumFractionDigits: 4,
                            maximumFractionDigits: 4,
                          }).format(usageTotals.totalCostUsdMicros / 1_000_000)}`
                        : null,
                    ]}
                  />
                </div>
              }
            />
            <RightPanelSectionBlock
              title={
                focus?.type === "tool"
                  ? "Selected tool"
                  : focus?.type === "message"
                    ? "Selected message"
                    : threadFocus.title
              }
              description={
                focus?.type === "tool"
                  ? "Inspector pivoted to the tool you selected in the conversation."
                  : focus?.type === "message"
                    ? "Inspector pivoted to the message you selected in the conversation."
                    : "The most important current thread context, kept in one place."
              }
            >
              {focus?.type === "tool" && selectedToolView ? (
                <RightPanelSurface className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-base font-semibold tracking-[-0.02em] text-foreground">
                      {selectedToolView.title}
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {selectedToolView.description}
                    </p>
                    <RightPanelTagRow tags={selectedToolView.tags} />
                  </div>

                  <RightPanelMetaList>
                    {selectedToolView.stats.map((stat) => (
                      <RightPanelMetaRow
                        key={stat.label}
                        label={stat.label}
                        value={stat.value}
                      />
                    ))}
                  </RightPanelMetaList>

                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      Output summary
                    </p>
                    <p className="text-sm leading-6 text-foreground">
                      {selectedToolView.outputSummary}
                    </p>
                  </div>

                  <InspectorCollapsible title="Raw output">
                    <RightPanelSurface className="bg-background px-3 py-3">
                      <FocusToolOutput output={selectedToolView.output} />
                    </RightPanelSurface>
                  </InspectorCollapsible>
                </RightPanelSurface>
              ) : focus?.type === "message" && selectedMessageView ? (
                <RightPanelSurface className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-base font-semibold tracking-[-0.02em] text-foreground">
                      {selectedMessageView.summaryTitle}
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {selectedMessageView.summaryDescription}
                    </p>
                    <RightPanelTagRow tags={selectedMessageView.chips} />
                  </div>

                  <RightPanelMetaList>
                    {selectedMessageView.metrics.map((metric) => (
                      <RightPanelMetaRow
                        key={metric.label}
                        label={metric.label}
                        value={metric.value}
                      />
                    ))}
                  </RightPanelMetaList>

                  {selectedMessageView.reasoningText?.trim() ? (
                    <InspectorCollapsible title="Reasoning">
                      <RightPanelSurface className="bg-background px-3 py-3">
                        <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                          {selectedMessageView.reasoningText}
                        </p>
                      </RightPanelSurface>
                    </InspectorCollapsible>
                  ) : null}
                </RightPanelSurface>
              ) : (
                <RightPanelSurface className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-base font-semibold tracking-[-0.02em] text-foreground">
                      {threadFocus.title}
                    </p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {threadFocus.description}
                    </p>
                    <RightPanelTagRow tags={threadFocus.tags} />
                  </div>

                  <RightPanelMetaList>
                    {threadFocus.stats.map((stat) => (
                      <RightPanelMetaRow key={stat.label} label={stat.label} value={stat.value} />
                    ))}
                  </RightPanelMetaList>
                </RightPanelSurface>
              )}
            </RightPanelSectionBlock>
          </TabsContent>

          <TabsContent value="evidence" className="mt-0">
            <RightPanelDossierHeader
              className="border-b-0 pb-2"
              title="Evidence dossier"
              description={evidenceModel.description}
              meta={
                <div className="space-y-3">
                  <RightPanelTagRow
                    tags={[
                      scopeLabel,
                      ...evidenceModel.domains,
                      `${sources.length} source${sources.length === 1 ? "" : "s"}`,
                    ]}
                  />
                </div>
              }
            />
            <RightPanelSectionBlock
              title="Evidence"
              description={evidenceModel.description}
              actions={
                sources.length > 0 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={handleCopySources}
                  >
                    <CopyIcon className="size-3.5" />
                    Copy all
                  </Button>
                ) : null
              }
            >
              <RightPanelSurface className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">{evidenceModel.title}</p>
                  <RightPanelTagRow tags={evidenceModel.domains} />
                </div>

                {evidenceModel.recentSources.length === 0 ? (
                  <RightPanelEmptyState
                    title="No evidence yet"
                    description="No web or citation evidence has been captured in this thread."
                  />
                ) : (
                  <div className="space-y-3">
                    {evidenceModel.recentSources.map((source) => (
                      <a
                        key={source.url}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block border-b border-border/40 pb-3 last:border-b-0 last:pb-0"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 space-y-1">
                            <p className="text-sm font-medium leading-6 text-foreground">
                              {source.title ?? source.domain}
                            </p>
                            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                              {source.domain}
                            </p>
                          </div>
                          <ExternalLinkIcon className="mt-1 size-4 shrink-0 text-muted-foreground" />
                        </div>
                        <RightPanelTagRow
                          className="mt-2"
                          tags={[
                            source.toolKey,
                            source.messageId ? `Msg ${source.messageId.slice(0, 8)}` : null,
                          ]}
                        />
                      </a>
                    ))}
                  </div>
                )}
              </RightPanelSurface>
            </RightPanelSectionBlock>
          </TabsContent>

          <TabsContent value="memory" className="mt-0">
            <RightPanelDossierHeader
              className="border-b-0 pb-2"
              title="Thread memory"
              description="Stored context summary for compaction and continuity."
              meta={
                <div className="space-y-3">
                  <RightPanelTagRow
                    tags={[
                      scopeLabel,
                      hasSummary ? "Artifact saved" : "No memory yet",
                      thread.summary?.updatedAt
                        ? `Updated ${formatTimestamp(thread.summary.updatedAt)}`
                        : null,
                    ]}
                  />
                </div>
              }
            />
            <RightPanelSectionBlock
              title="Memory"
              description="Stored thread memory used to compact older context without turning the inspector into a form."
              actions={
                hasSummary ? (
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={handleCopyMemory}
                    >
                      <CopyIcon className="size-3.5" />
                      Copy
                    </Button>
                    {isEditingMemory ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => {
                          setMemoryDraft(summaryText)
                          setIsEditingMemory(false)
                        }}
                      >
                        <XIcon className="size-3.5" />
                        Cancel
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => setIsEditingMemory(true)}
                      >
                        <PencilIcon className="size-3.5" />
                        Edit
                      </Button>
                    )}
                  </div>
                ) : null
              }
            >
              {hasSummary ? (
                <RightPanelSurface className="space-y-4">
                  <RightPanelMetaList>
                    <RightPanelMetaRow
                      label="State"
                      value={isEditingMemory ? "Editing draft" : "Stored artifact"}
                    />
                    <RightPanelMetaRow
                      label="Updated"
                      value={
                        thread.summary?.updatedAt
                          ? formatTimestamp(thread.summary.updatedAt)
                          : "Unknown"
                      }
                    />
                    <RightPanelMetaRow
                      label="Length"
                      value={`${memoryDraft.length}/2000 chars`}
                    />
                  </RightPanelMetaList>

                  {isEditingMemory ? (
                    <div className="space-y-3">
                      <Textarea
                        value={memoryDraft}
                        onChange={(event) => setMemoryDraft(event.target.value)}
                        maxLength={2000}
                        className="min-h-40 resize-y rounded-lg border-border/60 bg-background text-sm"
                        placeholder="Thread memory summary"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setMemoryDraft(summaryText)
                            setIsEditingMemory(false)
                          }}
                        >
                          Cancel
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
                            <>
                              <LoaderCircleIcon className="size-3.5 animate-spin" />
                              Saving
                            </>
                          ) : (
                            <>
                              <SaveIcon className="size-3.5" />
                              Save
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                        {summaryText}
                      </p>
                      <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-background px-3 py-2 text-xs text-muted-foreground">
                        <CheckCircle2Icon className="size-3.5" />
                        <span>
                          Memory stays readable by default. Editing is an explicit secondary action.
                        </span>
                      </div>
                    </div>
                  )}
                </RightPanelSurface>
              ) : (
                <RightPanelEmptyState
                  title="No rolling summary yet"
                  description="Summaries are created when compaction runs or when you compact the chat manually."
                />
              )}
            </RightPanelSectionBlock>
          </TabsContent>

          <TabsContent value="operations" className="mt-0">
            <RightPanelDossierHeader
              className="border-b-0 pb-2"
              title="Operations"
              description="Sandbox controls and thread-level execution activity."
              meta={
                <div className="space-y-3">
                  <RightPanelTagRow
                    tags={[
                      scopeLabel,
                      getDaytonaStatusLabel(daytonaStatus.status),
                      toolSummary.length > 0
                        ? `${toolSummary.length} tool type${toolSummary.length === 1 ? "" : "s"}`
                        : "No tool activity",
                    ]}
                  />
                </div>
              }
            />
            <RightPanelSectionBlock
              title="Sandbox"
              description="Daytona stays available here, but quieter unless the thread is actively using it."
            >
              <RightPanelSurface className="space-y-4">
                <RightPanelTagRow
                  tags={[
                    getDaytonaStatusLabel(daytonaStatus.status),
                    daytonaStatus.cloneStatus.replace(/_/g, " "),
                    daytonaStatus.repoUrl ? "Attached to thread" : null,
                  ]}
                />

                <RightPanelMetaList>
                  <RightPanelMetaRow
                    label="Repository"
                    value={daytonaStatus.repoUrl ?? "Not configured"}
                  />
                  <RightPanelMetaRow
                    label="Sandbox"
                    value={daytonaStatus.sandboxId ?? "—"}
                  />
                  <RightPanelMetaRow
                    label="Last updated"
                    value={
                      daytonaStatus.updatedAt
                        ? formatTimestamp(daytonaStatus.updatedAt)
                        : "—"
                    }
                  />
                </RightPanelMetaList>

                <InspectorCollapsible
                  title="Sandbox controls"
                  defaultOpen={hasDaytonaInstance || daytonaStatus.status === "failed"}
                  actions={
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={handleRefreshDaytonaStatus}
                      disabled={!daytonaStatus.sandboxId || isDaytonaBusy}
                    >
                      {daytonaAction === "status" ? (
                        <LoaderCircleIcon className="size-3.5 animate-spin" />
                      ) : (
                        <RefreshCcwIcon className="size-3.5" />
                      )}
                      Refresh
                    </Button>
                  }
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
                        onClick={
                          daytonaStatus.status === "stopped"
                            ? handleStartDaytona
                            : handleStopDaytona
                        }
                        disabled={!daytonaStatus.sandboxId || isDaytonaBusy}
                      >
                        {daytonaAction === "stop" || daytonaAction === "start" ? (
                          <LoaderCircleIcon className="size-4 animate-spin" />
                        ) : daytonaStatus.status === "stopped" ? (
                          <PlayIcon className="size-4" />
                        ) : (
                          <SquareIcon className="size-4" />
                        )}
                        {daytonaStatus.status === "stopped" ? "Start" : "Stop"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleDeleteDaytona}
                        disabled={!daytonaStatus.sandboxId || isDaytonaBusy}
                      >
                        {daytonaAction === "delete" ? (
                          <LoaderCircleIcon className="size-4 animate-spin" />
                        ) : (
                          <Trash2Icon className="size-4" />
                        )}
                        Delete
                      </Button>
                    </div>

                    <div
                      className={`rounded-lg border px-3 py-2 text-xs ${
                        daytonaStatus.status === "failed"
                          ? "border-destructive/30 bg-destructive/10 text-destructive"
                          : "border-border/40 bg-background text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {daytonaStatus.status === "failed" ? (
                          <TriangleAlertIcon className="size-3.5" />
                        ) : (
                          <CheckCircle2Icon className="size-3.5" />
                        )}
                        <span>{getDaytonaAcknowledgeText(daytonaStatus)}</span>
                      </div>
                    </div>
                  </div>
                </InspectorCollapsible>

                <InspectorCollapsible title="Tool activity" defaultOpen={toolSummary.length > 0}>
                  {toolSummary.length === 0 ? (
                    <RightPanelEmptyState
                      title="No tool calls yet"
                      description="Assistant tool usage will appear here once the thread starts operating on your behalf."
                    />
                  ) : (
                    <div className="space-y-2">
                      {toolSummary.map((tool) => (
                        <div
                          key={tool.toolKey}
                          className="flex items-center justify-between gap-3 border-b border-border/40 pb-2 last:border-b-0 last:pb-0"
                        >
                          <span className="text-sm font-medium text-foreground">
                            {tool.toolKey}
                          </span>
                          <RightPanelTagRow tags={[`${tool.count} calls`]} />
                        </div>
                      ))}
                    </div>
                  )}
                </InspectorCollapsible>
              </RightPanelSurface>
            </RightPanelSectionBlock>
          </TabsContent>
        </Tabs>
      </RightPanelScrollBody>
    </RightPanelShell>
  )
}
