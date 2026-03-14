"use client"

import { type ReactNode, createContext, use } from "react"
import type { Doc } from "@/convex/_generated/dataModel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  formatTimestamp,
  formatTokenCount,
  formatUsdMicros,
  getContextHealthLabel,
  getContextHealthState,
} from "@/lib/chat/thread-context"
import {
  Clock3Icon,
  DollarSignIcon,
  FolderIcon,
  Layers3Icon,
  MemoryStickIcon,
} from "lucide-react"

type ThreadContextState = {
  thread: Doc<"thread">
  project: Doc<"projects"> | null | undefined
  activeModel: Doc<"availableModels"> | null
  usageTotals: Doc<"thread">["usageTotals"]
  lastPromptTokens?: number
  summaryText: string
  hasSummary: boolean
  lastCompactedAt?: number
  contextUsageRatio: number | null
  contextHealthState: ReturnType<typeof getContextHealthState>
  contextLabel: string
  scopeLabel: string
}

type ThreadContextValue = {
  state: ThreadContextState
  actions: Record<string, never>
  meta: Record<string, never>
}

const ThreadContextContext = createContext<ThreadContextValue | null>(null)

function useThreadContext() {
  const value = use(ThreadContextContext)
  if (!value) {
    throw new Error("ThreadContext components must be used within ThreadContext.Provider")
  }
  return value
}

function getHealthButtonClassName(state: ReturnType<typeof getContextHealthState>) {
  switch (state) {
    case "healthy":
      return "border-emerald-200/80 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-300"
    case "elevated":
      return "border-amber-200/80 bg-amber-500/10 text-amber-700 hover:bg-amber-500/15 dark:border-amber-500/30 dark:text-amber-300"
    case "high":
      return "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15"
    default:
      return "border-border/60 bg-background/70 text-foreground hover:bg-muted/70"
  }
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="flex size-5 items-center justify-center rounded-full bg-background">
          {icon}
        </span>
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-right text-xs font-medium text-foreground">{value}</div>
    </div>
  )
}

function Provider({
  value,
  children,
}: {
  value: ThreadContextValue
  children: ReactNode
}) {
  return (
    <ThreadContextContext.Provider value={value}>
      {children}
    </ThreadContextContext.Provider>
  )
}

function BadgePopover() {
  const {
    state: {
      contextHealthState,
      contextLabel,
      lastPromptTokens,
      usageTotals,
      activeModel,
      contextUsageRatio,
      scopeLabel,
      hasSummary,
      summaryText,
      lastCompactedAt,
    },
  } = useThreadContext()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label="View context details"
          className={cn(
            "h-7 rounded-full px-2.5 text-xs font-medium shadow-sm",
            getHealthButtonClassName(contextHealthState),
          )}
        >
          <Layers3Icon className="size-3.5" />
          <span>{contextLabel}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        side="top"
        sideOffset={10}
        collisionPadding={12}
        className="w-[min(28rem,calc(100vw-1rem))] max-h-[min(70vh,32rem)] overflow-y-auto rounded-2xl p-3"
      >
        <PopoverHeader>
          <PopoverTitle>Thread context</PopoverTitle>
          <PopoverDescription>
            Current context usage, memory, and thread-level metadata for the next reply.
          </PopoverDescription>
        </PopoverHeader>

        <div className="space-y-2">
          <DetailRow
            icon={<Layers3Icon className="size-3.5" />}
            label="Last prompt tokens"
            value={formatTokenCount(lastPromptTokens)}
          />

          <DetailRow
            icon={<Layers3Icon className="size-3.5" />}
            label="Lifetime tokens"
            value={formatTokenCount(usageTotals?.totalTokens)}
          />

          {activeModel?.contextLength ? (
            <>
              <DetailRow
                icon={<Layers3Icon className="size-3.5" />}
                label="Context window"
                value={formatTokenCount(activeModel.contextLength)}
              />
              <DetailRow
                icon={<Layers3Icon className="size-3.5" />}
                label="Context usage"
                value={
                  <div className="flex items-center justify-end gap-2">
                    <span>
                      {contextUsageRatio !== null ? `${contextUsageRatio}%` : "—"}
                    </span>
                    <Badge variant="outline" className="rounded-full">
                      {getContextHealthLabel(contextHealthState)}
                    </Badge>
                  </div>
                }
              />
            </>
          ) : (
            <DetailRow
              icon={<Layers3Icon className="size-3.5" />}
              label="Context usage"
              value={
                <Badge variant="outline" className="rounded-full">
                  {getContextHealthLabel(contextHealthState)}
                </Badge>
              }
            />
          )}

          <DetailRow
            icon={<DollarSignIcon className="size-3.5" />}
            label="Estimated cost"
            value={formatUsdMicros(usageTotals?.totalCostUsdMicros)}
          />

          <DetailRow
            icon={<FolderIcon className="size-3.5" />}
            label="Scope"
            value={scopeLabel}
          />

          <DetailRow
            icon={<MemoryStickIcon className="size-3.5" />}
            label="Compacted"
            value={hasSummary ? "Yes" : "No"}
          />

          {hasSummary ? (
            <>
              <DetailRow
                icon={<Clock3Icon className="size-3.5" />}
                label="Last compacted"
                value={formatTimestamp(lastCompactedAt)}
              />
              <div className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5">
                <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Rolling summary
                </p>
                <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                  {summaryText}
                </p>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-3 py-3">
              <p className="text-sm text-muted-foreground">
                No compaction yet. A rolling summary appears when the conversation
                exceeds thresholds or when you use Compact chat.
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function RollingSummaryCard() {
  const {
    state: { hasSummary, summaryText, lastCompactedAt },
  } = useThreadContext()

  return (
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
            {lastCompactedAt
              ? `Compacted ${formatTimestamp(lastCompactedAt)}`
              : "Available"}
          </Badge>
        ) : null}
      </div>

      {hasSummary ? (
        <p className="mt-3 whitespace-pre-wrap rounded-md border border-border/50 bg-background px-3 py-2 text-sm text-foreground">
          {summaryText}
        </p>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          No compaction yet. A rolling summary appears when the conversation exceeds
          thresholds or when you use Compact chat.
        </p>
      )}
    </div>
  )
}

function UsageSnapshotCard() {
  const {
    state: {
      activeModel,
      lastPromptTokens,
      usageTotals,
      contextUsageRatio,
      contextHealthState,
    },
  } = useThreadContext()

  return (
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
        {activeModel?.contextLength ? (
          <Badge variant="secondary">
            {formatTokenCount(activeModel.contextLength)} context
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
      <div className="mt-3 rounded-md border border-border/60 bg-background px-3 py-2">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-muted-foreground">Last prompt vs context</span>
          <span className="font-medium text-foreground">
            {formatTokenCount(lastPromptTokens)} /{" "}
            {formatTokenCount(activeModel?.contextLength)}
            {contextUsageRatio !== null ? ` (${contextUsageRatio}%)` : ""}
          </span>
        </div>
        <div className="mt-2">
          <Badge variant="outline" className="rounded-full">
            {getContextHealthLabel(contextHealthState)}
          </Badge>
        </div>
      </div>
    </div>
  )
}

export const ThreadContext = {
  Provider,
  BadgePopover,
  RollingSummaryCard,
  UsageSnapshotCard,
}
