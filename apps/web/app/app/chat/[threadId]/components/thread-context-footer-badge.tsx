"use client"

import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  getContextUsageRatio,
} from "@/lib/chat/thread-context"
import {
  Clock3Icon,
  DollarSignIcon,
  FolderIcon,
  Layers3Icon,
  MemoryStickIcon,
} from "lucide-react"
import { useChatConfig } from "../../components/chat-provider"

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

export function ThreadContextFooterBadge() {
  const { thread, project, selectedModelId, availableModels } = useChatConfig()

  if (!thread) return null

  const activeModel =
    availableModels.find((model) => model.modelId === selectedModelId) ??
    availableModels.find((model) => model.modelId === thread.model) ??
    null

  const usageTotals = thread.usageTotals
  const summaryText = thread.summary?.summaryText?.trim() ?? ""
  const hasSummary = Boolean(summaryText)
  const contextUsageRatio = getContextUsageRatio({
    totalTokens: usageTotals?.totalTokens,
    contextLength: activeModel?.contextLength,
  })
  const contextHealthState = getContextHealthState(contextUsageRatio)
  const contextLabel = activeModel?.contextLength
    ? `${formatTokenCount(usageTotals?.totalTokens)} / ${formatTokenCount(activeModel.contextLength)}`
    : formatTokenCount(usageTotals?.totalTokens)
  const scopeLabel =
    thread.scope === "project" && project
      ? project.title
      : "All workspace"

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
        align="start"
        side="top"
        sideOffset={10}
        className="w-[min(28rem,calc(100vw-2rem))] rounded-2xl p-3"
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
            label="Tokens used"
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
            label="Memory"
            value={hasSummary ? "Available" : "No summary yet"}
          />

          {hasSummary ? (
            <>
              <DetailRow
                icon={<Clock3Icon className="size-3.5" />}
                label="Summary updated"
                value={formatTimestamp(thread.summary?.updatedAt)}
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
                No summary yet. A rolling summary appears after the conversation is
                compacted for context.
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
