import { Loader2 } from "lucide-react"
import type { ToolCall } from "./tool-types"
import {
  getToolDisplayNameFromKey,
  getToolInputSummary,
  getToolStateInfo,
  getToolSummary,
} from "./tool-meta"

interface ToolProgressBannerProps {
  toolCalls: ToolCall[]
  isStreaming: boolean
}

const isActiveToolCall = (toolCall: ToolCall) =>
  toolCall.state === "input-streaming" ||
  toolCall.state === "input-available" ||
  toolCall.state === "approval-requested" ||
  (toolCall.state === "output-available" && toolCall.preliminary === true)

export function ToolProgressBanner({
  toolCalls,
  isStreaming,
}: ToolProgressBannerProps) {
  if (!isStreaming) return null

  const activeToolCalls = toolCalls.filter(isActiveToolCall)
  if (activeToolCalls.length === 0) return null

  return (
    <div className="rounded-md border border-border/45 bg-muted/15 px-3 py-2">
      <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" />
        <span>Tool activity</span>
      </div>
      <div className="space-y-1">
        {activeToolCalls.map((toolCall) => {
          const label = getToolDisplayNameFromKey(toolCall.toolKey)
          const description =
            getToolSummary(toolCall) ??
            getToolInputSummary(toolCall.input) ??
            getToolStateInfo(toolCall.state, toolCall.preliminary).badgeLabel

          return (
            <div
              key={toolCall.id}
              className="flex items-start gap-2 text-xs text-muted-foreground"
            >
              <span className="mt-0.5 text-foreground">{label}</span>
              <span>{description}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
