import type { UIMessage } from "ai"
import { estimateTokensFromUIMessages, getTextFromUIMessage } from "@taskflow/chat-content"
import type { CompactionConfig, CompactionPlan, ThreadCompaction } from "./types"

function splitProtectedTail(
  messages: UIMessage[],
  keepLastN: number
): { candidateMessages: UIMessage[]; protectedMessages: UIMessage[] } {
  if (keepLastN <= 0) {
    return { candidateMessages: messages, protectedMessages: [] }
  }
  if (keepLastN >= messages.length) {
    return { candidateMessages: [], protectedMessages: messages }
  }
  const startOfTail = messages.length - keepLastN
  return {
    candidateMessages: messages.slice(0, startOfTail),
    protectedMessages: messages.slice(startOfTail),
  }
}

function findCursorIndex(
  messages: UIMessage[],
  cursorMessageId: string | null | undefined
): number {
  if (!cursorMessageId) return -1
  return messages.findIndex((m) => m.id === cursorMessageId)
}

/** Select model context with cursor-aware trimming of already summarized history. */
export function selectContextMessages({
  messages,
  summarizedThroughMessageId,
  recentMessageCount,
}: {
  messages: UIMessage[]
  summarizedThroughMessageId?: string | null
  recentMessageCount: number
}): UIMessage[] {
  if (!summarizedThroughMessageId) return messages

  const keepLastN = Math.max(0, recentMessageCount)
  const { candidateMessages, protectedMessages } = splitProtectedTail(messages, keepLastN)
  const cursorInCandidates = findCursorIndex(candidateMessages, summarizedThroughMessageId)

  if (cursorInCandidates >= 0) {
    const unsummarizedCandidates = candidateMessages.slice(cursorInCandidates + 1)
    return [...unsummarizedCandidates, ...protectedMessages]
  }

  const cursorInProtected = findCursorIndex(protectedMessages, summarizedThroughMessageId)
  if (cursorInProtected >= 0) {
    // Cursor should typically live in candidateMessages, but if it ends up in the protected tail
    // we keep the full tail to avoid accidentally dropping all recent context.
    return protectedMessages
  }

  // If the cursor can't be found, keep full history to avoid dropping unsummarized context.
  return messages
}

/** Plan a compaction run. Returns what to summarize and what to keep. */
export function planCompaction({
  messages,
  previousCompaction,
  config,
  forceManual = false,
}: {
  messages: UIMessage[]
  previousCompaction?: ThreadCompaction | null
  config: CompactionConfig
  forceManual?: boolean
}): CompactionPlan {
  const keepLastN = Math.max(0, config.recentMessageCount)
  const messageCount = messages.length
  const tokenCount = estimateTokensFromUIMessages(messages, {
    includeToolText: false,
    maxCharsPerMessage: 8000,
  })

  const { candidateMessages, protectedMessages } = splitProtectedTail(
    messages,
    keepLastN
  )

  const cursorMessageId =
    previousCompaction?.summarizedThroughMessageId ?? null
  const cursorIndex = findCursorIndex(candidateMessages, cursorMessageId)
  const startIndex = cursorIndex >= 0 ? cursorIndex + 1 : 0
  const messagesToSummarize = candidateMessages.slice(startIndex)
  const nextCursorMessageId =
    messagesToSummarize.length > 0
      ? messagesToSummarize[messagesToSummarize.length - 1].id
      : cursorMessageId

  if (forceManual) {
    if (messagesToSummarize.length === 0) {
      return {
        shouldCompact: false,
        reason: "manual",
        currentMessageCount: messageCount,
        currentTokenEstimate: tokenCount,
        cursorMessageId,
        messagesToSummarize: [],
        messagesToKeep: messages,
        nextCursorMessageId,
      }
    }
    return {
      shouldCompact: true,
      reason: "manual",
      currentMessageCount: messageCount,
      currentTokenEstimate: tokenCount,
      cursorMessageId,
      messagesToSummarize,
      messagesToKeep: protectedMessages,
      nextCursorMessageId,
    }
  }

  const overMessages = messageCount > config.messageThreshold
  const overTokens = tokenCount > config.tokenThreshold
  const shouldCompact = overMessages || overTokens

  if (!shouldCompact || messagesToSummarize.length === 0) {
    return {
      shouldCompact: false,
      reason: overMessages ? "messages" : overTokens ? "tokens" : null,
      currentMessageCount: messageCount,
      currentTokenEstimate: tokenCount,
      cursorMessageId,
      messagesToSummarize: [],
      messagesToKeep: messages,
      nextCursorMessageId,
    }
  }

  return {
    shouldCompact: true,
    reason: overMessages ? "messages" : "tokens",
    currentMessageCount: messageCount,
    currentTokenEstimate: tokenCount,
    cursorMessageId,
    messagesToSummarize,
    messagesToKeep: protectedMessages,
    nextCursorMessageId,
  }
}

/** Format messages as a transcript for the summarizer LLM */
export function formatMessagesForSummarizer(
  messages: UIMessage[],
  options?: { includeToolText?: boolean; maxCharsPerMessage?: number }
): string {
  return messages
    .map((message) => {
      const text = getTextFromUIMessage(message, options)
      if (!text) return ""
      return `${message.role}: ${text}`
    })
    .filter(Boolean)
    .join("\n")
}
