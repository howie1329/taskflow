import type { UIMessage } from "ai"

export type ChatRole = "user" | "assistant" | "system"

export type SummarizationTrigger =
  | { kind: "tokens"; maxTokens: number }
  | { kind: "messages"; maxMessages: number }
  | { kind: "either"; maxTokens: number; maxMessages: number }

export type SummarizationOptions = {
  trigger: SummarizationTrigger
  keepLastN: number
  maxCharsPerMessage?: number
  includeToolText?: boolean
}

export type ThreadSummaryState = {
  schemaVersion: 1
  summaryText: string
  summarizedThroughMessageId: string
  updatedAt: number
}

export type SummarizationPlan = {
  shouldSummarize: boolean
  reason: "tokens" | "messages" | "either" | null
  currentMessageCount: number
  currentTokenEstimate: number
  cursorMessageId: string | null
  keepLastN: number
  messagesToSummarize: UIMessage[]
  messagesToKeep: UIMessage[]
  nextCursorMessageId: string | null
}

export type TextExtractionOptions = {
  includeToolText?: boolean
  maxCharsPerMessage?: number
}

export type StoredThreadMessage = {
  messageId: string
  role: "user" | "assistant" | "system"
  model: string
  content: unknown
  createdAt?: number
  updatedAt?: number
}
