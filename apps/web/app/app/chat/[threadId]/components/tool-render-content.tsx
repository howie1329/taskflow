import type { ReactNode } from "react"
import type { ToolCall } from "./tool-types"
import {
  getToolStateInfo,
  summarizeToolOutput,
} from "./tool-meta"
import { getToolDefinition } from "./tool-definitions"

export function renderToolContent(toolCall: ToolCall): ReactNode {
  if (
    toolCall.state !== "output-available" &&
    toolCall.state !== "output-error"
  ) {
    return (
      <p className="text-sm text-muted-foreground">
        {getToolStateInfo(toolCall.state).badgeLabel}
      </p>
    )
  }

  if (toolCall.errorText) {
    return <p className="text-sm text-destructive">{toolCall.errorText}</p>
  }

  const renderedContent = getToolDefinition(toolCall.toolKey)?.render?.(toolCall)
  if (renderedContent) {
    return renderedContent
  }

  const summary = summarizeToolOutput(toolCall.output)
  if (summary) {
    return <p className="text-sm">{summary}</p>
  }

  return <p className="text-sm text-muted-foreground">Completed</p>
}
