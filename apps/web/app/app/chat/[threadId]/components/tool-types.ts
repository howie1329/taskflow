import type { ToolUIPart } from "ai"

export type ToolCall = {
  id: string
  toolKey: string
  state: ToolUIPart["state"]
  input?: unknown
  output?: unknown
  errorText?: string
}

export type ToolStateInfo = {
  badgeLabel: string
  stepStatus: "pending" | "active" | "complete"
  isError: boolean
}
