import type { CompactionConfig } from "./types.js"

export const DEFAULT_COMPACTION_CONFIG: CompactionConfig = {
  // Always keep the last N UI messages verbatim in the model context.
  // Smaller = cheaper but more "amnesiac"; larger = more coherent but higher input tokens.
  recentMessageCount: 12,

  // Consider running compaction when total message count exceeds this threshold.
  // Note: compaction only summarizes messages older than the protected recentMessageCount tail.
  messageThreshold: 24,

  // Consider running compaction when estimated tokens (from UI messages) exceeds this threshold.
  // This uses a rough estimate and does not include tool text by default.
  tokenThreshold: 64000,

  // Minimum transcript length (characters) required to generate/update a summary.
  // Prevents creating low-signal summaries from tiny conversations.
  minTranscriptChars: 300,

  // Hard cap on rolling summary length (characters). This summary is prepended as a system message.
  maxSummaryChars: 2800,

  // Minimum minutes between automatic compactions (manual compaction bypasses this).
  minCompactionIntervalMinutes: 5,
}
