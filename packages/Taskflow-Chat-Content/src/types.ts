export type ChatRole = "user" | "assistant" | "system"

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
