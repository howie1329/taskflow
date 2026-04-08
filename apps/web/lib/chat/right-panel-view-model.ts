import type { UIMessage } from "ai"
import {
  formatTimestamp,
  formatTokenCount,
  formatUsdMicros,
} from "@/lib/chat/thread-context"
import type { ExtractedChatSource } from "@/lib/chat/extract-sources"
import { getMessageFiles, getMessageReasoning, getMessageText } from "@/app/app/chat/[threadId]/components/message-parts"
import { getToolCalls } from "@/app/app/chat/[threadId]/components/tool-calls"
import {
  getToolDisplayNameFromKey,
  getToolInputQuery,
  getToolStateInfo,
  getToolSummary,
} from "@/app/app/chat/[threadId]/components/tool-meta"

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

function truncateText(text: string, maxLength = 180) {
  const normalized = text.replace(/\s+/g, " ").trim()
  if (!normalized) return ""
  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, maxLength).trim()}...`
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

export function buildThreadDossierHeader({
  activeModel,
  contextHealthLabel,
  contextLabel,
  updatedAt,
  sourceCount,
  daytonaSignal,
}: {
  activeModel?: string | null
  contextHealthLabel: string
  contextLabel: string
  updatedAt?: number
  sourceCount: number
  daytonaSignal?: string | null
}) {
  const tags = [
    activeModel ? `Model ${activeModel}` : null,
    contextHealthLabel !== "Unknown" ? `Context ${contextHealthLabel}` : null,
    contextLabel !== "—" ? contextLabel : null,
    sourceCount > 0 ? `${sourceCount} sources` : "No sources yet",
  ]

  const status = daytonaSignal ?? (updatedAt ? `Updated ${formatTimestamp(updatedAt)}` : "Ready")

  return {
    status,
    tags,
  }
}

export function buildEvidenceSummary({
  sources,
}: {
  sources: ExtractedChatSource[]
}) {
  const topDomains = Array.from(
    new Set(
      sources
        .map((source) => source.domain)
        .filter((domain): domain is string => Boolean(domain)),
    ),
  ).slice(0, 3)
  const recentSources = sources.slice(-3).reverse()
  const hasRepoEvidence = sources.some((source) => source.kind === "file")

  return {
    title:
      sources.length > 0 ? `${sources.length} source${sources.length === 1 ? "" : "s"} captured` : "No evidence yet",
    description:
      sources.length > 0
        ? hasRepoEvidence && topDomains.length > 0
          ? `Grounded in repo citations and ${topDomains.join(", ")}`
          : hasRepoEvidence
            ? "Grounded in repo citations and tool evidence."
            : `Grounded in ${topDomains.join(", ")}`
        : "Searches, citations, and tool evidence will collect here as the thread develops.",
    domains: topDomains,
    recentSources,
  }
}

export function buildThreadFocusSummary({
  messages,
  summaryText,
}: {
  messages: UIMessage[]
  summaryText: string
}) {
  const lastAssistantMessage = [...messages]
    .reverse()
    .find((message) => message.role === "assistant")
  const lastUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user")

  const assistantText = lastAssistantMessage ? getMessageText(lastAssistantMessage) : ""
  const userText = lastUserMessage ? getMessageText(lastUserMessage) : ""
  const lastAssistantTools = lastAssistantMessage ? getToolCalls(lastAssistantMessage) : []

  return {
    title: "Current thread focus",
    description:
      truncateText(assistantText, 220) ||
      truncateText(summaryText, 220) ||
      "Continue the conversation to build a clearer dossier of this thread.",
    stats: [
      {
        label: "Latest user intent",
        value: truncateText(userText, 80) || "No user message yet",
      },
      {
        label: "Latest assistant output",
        value: assistantText.trim() ? getMessageLengthLabel(assistantText) : "No assistant response yet",
      },
      {
        label: "Tool activity",
        value:
          lastAssistantTools.length > 0
            ? `${lastAssistantTools.length} tool call${lastAssistantTools.length === 1 ? "" : "s"}`
            : "No recent tool calls",
      },
    ],
    tags: [
      lastAssistantMessage ? "Latest assistant response" : null,
      summaryText ? "Memory saved" : "No memory yet",
    ],
  }
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

export function buildToolFocusViewModel({
  message,
  toolCallId,
}: {
  message: UIMessage | null
  toolCallId: string
}) {
  if (!message) return null

  const toolCall = getToolCalls(message).find((item) => item.id === toolCallId)
  if (!toolCall) return null

  const stateInfo = getToolStateInfo(toolCall.state)
  const summary = getToolSummary(toolCall)
  const query = getToolInputQuery(toolCall.input, toolCall.toolKey)

  return {
    title: getToolDisplayNameFromKey(toolCall.toolKey),
    description: summary ?? stateInfo.badgeLabel,
    tags: [
      stateInfo.badgeLabel,
      toolCall.toolKey,
      query ? truncateText(query, 36) : null,
    ],
    stats: [
      {
        label: "Status",
        value: stateInfo.badgeLabel,
      },
      {
        label: "Input",
        value: query ?? "No compact input summary",
      },
      {
        label: "Message",
        value: message.id.slice(0, 8),
      },
    ],
    outputSummary:
      summary ??
      (typeof toolCall.errorText === "string" && toolCall.errorText.trim()
        ? toolCall.errorText
        : "No structured output summary available."),
    output: toolCall.output,
  }
}
