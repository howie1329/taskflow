import type { UIMessage } from "ai"

/** Structured thread memory for prompt context */
export type ThreadState = {
  activeGoal?: string
  currentTopic?: string
  importantFacts: string[]
  decisions: string[]
  unresolvedItems: string[]
  referencedEntities: string[]
  userPreferences: string[]
  recentToolFindings: string[]
  warningsOrRisks: string[]
}

/** Metadata about the last compaction */
export type CompactionMetadata = {
  lastCompactedAt: number
  lastCompactedMessageId: string
  messageCountAtCompaction: number
  tokenEstimateAtCompaction?: number
}

/** Configuration for when and how to compact */
export type CompactionConfig = {
  recentMessageCount: number
  messageThreshold: number
  tokenThreshold: number
  minTranscriptChars: number
  maxSummaryChars: number
  maxTranscriptChars: number
  /** Minimum minutes between auto-compactions */
  minCompactionIntervalMinutes: number
}

/** Result of planning a compaction run */
export type CompactionPlan = {
  shouldCompact: boolean
  reason: "messages" | "tokens" | "manual" | null
  currentMessageCount: number
  currentTokenEstimate: number
  cursorMessageId: string | null
  messagesToSummarize: UIMessage[]
  messagesToKeep: UIMessage[]
  nextCursorMessageId: string | null
}

/** Persisted compaction state on a thread */
export type ThreadCompaction = {
  schemaVersion: 1
  summaryText: string
  threadState: ThreadState
  summarizedThroughMessageId: string
  compactionMetadata: CompactionMetadata
  updatedAt: number
}

/** Input for building compaction context */
export type CompactionInput = {
  messages: UIMessage[]
  previousSummary?: string | null
  previousThreadState?: ThreadState | null
  summarizedThroughMessageId?: string | null
}
