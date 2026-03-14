import type { CompactionConfig } from "./types"

export const DEFAULT_COMPACTION_CONFIG: CompactionConfig = {
  recentMessageCount: 4,
  messageThreshold: 2,
  tokenThreshold: 10000,
  minTranscriptChars: 180,
  maxSummaryChars: 2800,
  maxTranscriptChars: 12000,
  minCompactionIntervalMinutes: 2,
}
