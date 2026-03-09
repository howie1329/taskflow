import type { FileUIPart, UIMessage } from "ai"
import { getToolCalls } from "./tool-calls"
import type { ToolCall } from "./tool-types"

export type ToolProgressPart = {
  type: "data-toolProgress"
  id?: string
  data: {
    toolKey: string
    toolCallId: string
    status: "running" | "done" | "error"
    text: string
  }
}

export type ParsedMessageParts = {
  text: string
  reasoningText: string | null
  files: FileUIPart[]
  toolCalls: ToolCall[]
  toolProgress: ToolProgressPart[]
}

export function getMessageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("")
}

export function getMessageReasoning(message: UIMessage): string | null {
  const reasoningParts = message.parts.filter((part) => part.type === "reasoning")
  if (reasoningParts.length === 0) return null

  return reasoningParts
    .map((part) => (part as { type: "reasoning"; text: string }).text)
    .join("")
}

export function getMessageFiles(message: UIMessage): FileUIPart[] {
  return message.parts
    .filter((part) => part.type === "file")
    .map((part) => part as FileUIPart)
}

export function getMessageToolProgress(message: UIMessage): ToolProgressPart[] {
  return message.parts.filter(
    (part): part is ToolProgressPart => part.type === "data-toolProgress",
  )
}

export function parseMessageParts(message: UIMessage): ParsedMessageParts {
  return {
    text: getMessageText(message),
    reasoningText: getMessageReasoning(message),
    files: getMessageFiles(message),
    toolCalls: message.role === "assistant" ? getToolCalls(message) : [],
    toolProgress: getMessageToolProgress(message),
  }
}
