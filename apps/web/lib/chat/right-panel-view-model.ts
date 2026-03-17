import type { UIMessage } from "ai"
import {
  formatTimestamp,
  formatTokenCount,
  formatUsdMicros,
} from "@/lib/chat/thread-context"
import { getMessageFiles, getMessageReasoning, getMessageText } from "@/app/app/chat/[threadId]/components/message-parts"
import { getToolCalls } from "@/app/app/chat/[threadId]/components/tool-calls"
import { getToolStateInfo } from "@/app/app/chat/[threadId]/components/tool-meta"

type SummaryChip = {
  id: string
  label: string
}

function withLabel(label: string, value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return null
  return `${value} ${label}`.trim()
}

function estimateTokens(text: string) {
  return Math.max(1, Math.ceil(text.length / 4))
}

function getMessageLengthLabel(text: string) {
  const wordCount = text.trim().length ? text.trim().split(/\s+/).length : 0
  return `${wordCount} words`
}

export function buildThreadInspectorSummary({
  scopeLabel,
  assistantCount,
  messageCount,
  updatedAt,
  sourceCount,
  hasSummary,
}: {
  scopeLabel: string
  assistantCount: number
  messageCount: number
  updatedAt?: number
  sourceCount: number
  hasSummary: boolean
}) {
  const chips: SummaryChip[] = [
    {
      id: "scope",
      label: scopeLabel,
    },
    {
      id: "messages",
      label: withLabel("messages", messageCount) ?? "",
    },
    {
      id: "assistant",
      label: withLabel("assistant", assistantCount) ?? "",
    },
    {
      id: "sources",
      label: withLabel("sources", sourceCount) ?? "",
    },
    {
      id: "memory",
      label: hasSummary ? "memory saved" : "no memory",
    },
    {
      id: "updated",
      label: `updated ${formatTimestamp(updatedAt)}`,
    },
  ].filter((chip) => chip.label)

  const status = sourceCount > 0 ? `Found ${sourceCount} sources` : "Ready for context"

  return {
    status,
    chips,
  }
}

export function buildThreadContextChips({
  activeModel,
  contextLabel,
  contextHealthLabel,
  costUsdMicros,
}: {
  activeModel?: string | null
  contextLabel: string
  contextHealthLabel: string
  costUsdMicros?: number
}) {
  return [
    activeModel ? `model ${activeModel}` : null,
    contextLabel !== "—" ? `context ${contextLabel}` : null,
    contextHealthLabel !== "Unknown"
      ? `health ${contextHealthLabel.toLowerCase()}`
      : null,
    costUsdMicros !== undefined ? `cost ${formatUsdMicros(costUsdMicros)}` : null,
  ]
}

export function buildMessageDetailsViewModel(message: UIMessage | null) {
  if (!message) return null

  const metadata = message.metadata as
    | {
        usage?: {
          inputTokens: number
          outputTokens: number
          totalTokens?: number
        }
        costUsdMicros?: number
      }
    | undefined

  const text = getMessageText(message)
  const reasoningText =
    message.role === "assistant" ? getMessageReasoning(message) : null
  const attachments = getMessageFiles(message)
  const toolCalls = message.role === "assistant" ? getToolCalls(message) : []
  const usage = metadata?.usage
  const totalTokens =
    usage?.totalTokens ??
    (usage ? usage.inputTokens + usage.outputTokens : estimateTokens(text))
  const completedTools = toolCalls.filter(
    (toolCall) => getToolStateInfo(toolCall.state).badgeLabel === "Completed",
  ).length
  const summaryTitle =
    message.role === "assistant" ? "Assistant response" : "Message details"
  const summaryDescription = text.trim()
    ? text.trim().slice(0, 180)
    : "No text in this message."

  return {
    summaryTitle,
    summaryDescription,
    chips: [
      message.role,
      withLabel("tokens", totalTokens),
      getMessageLengthLabel(text),
      attachments.length > 0 ? withLabel("attachments", attachments.length) : null,
      toolCalls.length > 0 ? withLabel("tools", toolCalls.length) : null,
      completedTools > 0 ? withLabel("done", completedTools) : null,
      reasoningText?.trim()
        ? withLabel("reasoning", reasoningText.trim().split(/\s+/).length)
        : null,
      metadata?.costUsdMicros !== undefined
        ? `cost ${formatUsdMicros(metadata.costUsdMicros)}`
        : null,
    ],
    metrics: usage
      ? [
          {
            label: "Input tokens",
            value: formatTokenCount(usage.inputTokens),
          },
          {
            label: "Output tokens",
            value: formatTokenCount(usage.outputTokens),
          },
          {
            label: "Total tokens",
            value: formatTokenCount(totalTokens),
          },
          metadata?.costUsdMicros !== undefined
            ? {
                label: "Estimated cost",
                value: formatUsdMicros(metadata.costUsdMicros),
              }
            : null,
        ].filter(Boolean)
      : [
          {
            label: "Estimated tokens",
            value: formatTokenCount(totalTokens),
          },
        ],
    text,
    reasoningText,
    attachments,
    toolCalls,
  }
}
