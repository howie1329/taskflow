import type { UIMessage } from "ai"
import type {
  SummarizationOptions,
  SummarizationPlan,
  ThreadSummaryState,
} from "./types.js"
import { estimateTokensFromUIMessages } from "./tokens.js"
import { getTextFromUIMessage } from "./text.js"

const SUMMARY_MESSAGE_ID = "summary_system_v1"

const shouldTriggerSummarization = (
  options: SummarizationOptions,
  messageCount: number,
  tokenCount: number
): { shouldSummarize: boolean; reason: SummarizationPlan["reason"] } => {
  if (options.trigger.kind === "tokens") {
    return {
      shouldSummarize: tokenCount > options.trigger.maxTokens,
      reason: tokenCount > options.trigger.maxTokens ? "tokens" : null,
    }
  }

  if (options.trigger.kind === "messages") {
    return {
      shouldSummarize: messageCount > options.trigger.maxMessages,
      reason: messageCount > options.trigger.maxMessages ? "messages" : null,
    }
  }

  const overTokens = tokenCount > options.trigger.maxTokens
  const overMessages = messageCount > options.trigger.maxMessages
  return {
    shouldSummarize: overTokens || overMessages,
    reason: overTokens || overMessages ? "either" : null,
  }
}

const splitProtectedTail = (messages: UIMessage[], keepLastN: number) => {
  if (keepLastN <= 0) {
    return {
      candidateMessages: messages,
      protectedMessages: [] as UIMessage[],
    }
  }

  if (keepLastN >= messages.length) {
    return {
      candidateMessages: [] as UIMessage[],
      protectedMessages: messages,
    }
  }

  const startOfTail = messages.length - keepLastN
  return {
    candidateMessages: messages.slice(0, startOfTail),
    protectedMessages: messages.slice(startOfTail),
  }
}

const findCursorIndex = (
  messages: UIMessage[],
  cursorMessageId: string | null | undefined
): number => {
  if (!cursorMessageId) return -1
  return messages.findIndex((message) => message.id === cursorMessageId)
}

export const planSummarization = ({
  messages,
  previousSummary,
  options,
}: {
  messages: UIMessage[]
  previousSummary?: ThreadSummaryState | null
  options: SummarizationOptions
}): SummarizationPlan => {
  const normalizedKeepLastN = Math.max(0, options.keepLastN)
  const messageCount = messages.length
  const tokenCount = estimateTokensFromUIMessages(messages, options)

  const triggerResult = shouldTriggerSummarization(
    options,
    messageCount,
    tokenCount
  )

  const { candidateMessages, protectedMessages } = splitProtectedTail(
    messages,
    normalizedKeepLastN
  )

  const cursorMessageId = previousSummary?.summarizedThroughMessageId ?? null
  const cursorIndex = findCursorIndex(candidateMessages, cursorMessageId)
  const startIndex = cursorIndex >= 0 ? cursorIndex + 1 : 0
  const messagesToSummarize = candidateMessages.slice(startIndex)
  const nextCursorMessageId =
    messagesToSummarize.length > 0
      ? messagesToSummarize[messagesToSummarize.length - 1].id
      : cursorMessageId

  if (!triggerResult.shouldSummarize || messagesToSummarize.length === 0) {
    return {
      shouldSummarize: false,
      reason: triggerResult.reason,
      currentMessageCount: messageCount,
      currentTokenEstimate: tokenCount,
      cursorMessageId,
      keepLastN: normalizedKeepLastN,
      messagesToSummarize: [],
      messagesToKeep: messages,
      nextCursorMessageId,
    }
  }

  return {
    shouldSummarize: true,
    reason: triggerResult.reason,
    currentMessageCount: messageCount,
    currentTokenEstimate: tokenCount,
    cursorMessageId,
    keepLastN: normalizedKeepLastN,
    messagesToSummarize,
    messagesToKeep: protectedMessages,
    nextCursorMessageId,
  }
}

export const formatMessagesForSummarizer = (
  messages: UIMessage[],
  options?: Pick<SummarizationOptions, "includeToolText" | "maxCharsPerMessage">
): string => {
  return messages
    .map((message) => {
      const messageText = getTextFromUIMessage(message, options)
      if (!messageText) return ""
      return `${message.role}: ${messageText}`
    })
    .filter(Boolean)
    .join("\n")
}

export const injectRollingSummary = ({
  summaryText,
  messagesToKeep,
}: {
  summaryText: string
  messagesToKeep: UIMessage[]
}): UIMessage[] => {
  const cleanSummary = summaryText.trim()
  if (!cleanSummary) return messagesToKeep

  const summaryMessage: UIMessage = {
    id: SUMMARY_MESSAGE_ID,
    role: "system",
    parts: [{ type: "text", text: `Conversation summary:\n${cleanSummary}` }],
  } as UIMessage

  return [summaryMessage, ...messagesToKeep]
}
