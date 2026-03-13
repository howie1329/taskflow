import type { UIMessage } from "ai"
import { estimateTokensFromUIMessages } from "@taskflow/chat-content"
import type { CompactionConfig } from "./types"

/** Estimate token count for a list of messages */
export function estimateMessageTokens(
  messages: UIMessage[],
  options?: { includeToolText?: boolean; maxCharsPerMessage?: number }
): number {
  return estimateTokensFromUIMessages(messages, options)
}

/** Check if compaction should run based on message count */
export function shouldCompactByMessageCount(
  messageCount: number,
  config: Pick<CompactionConfig, "messageThreshold">
): boolean {
  return messageCount > config.messageThreshold
}

/** Check if compaction should run based on token count */
export function shouldCompactByTokenCount(
  tokenCount: number,
  config: Pick<CompactionConfig, "tokenThreshold">
): boolean {
  return tokenCount > config.tokenThreshold
}

/** Check if we're past the cooldown since last compaction */
export function isPastCompactionCooldown(
  lastCompactedAt: number | undefined,
  config: Pick<CompactionConfig, "minCompactionIntervalMinutes">
): boolean {
  if (!lastCompactedAt) return true
  const cooldownMs = config.minCompactionIntervalMinutes * 60 * 1000
  return Date.now() - lastCompactedAt >= cooldownMs
}
