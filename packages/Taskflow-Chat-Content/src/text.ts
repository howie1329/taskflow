import type { UIMessage } from "ai"
import type { TextExtractionOptions } from "./types.js"

const DEFAULT_MAX_CHARS_PER_MESSAGE = 8000

const clampText = (text: string, maxChars: number): string => {
  if (text.length <= maxChars) return text
  return text.slice(0, maxChars)
}

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

const stringifyIfShort = (value: unknown, maxChars: number): string => {
  if (typeof value === "string") return clampText(value, maxChars)
  try {
    const stringified = JSON.stringify(value)
    return clampText(stringified ?? "", maxChars)
  } catch {
    return ""
  }
}

export const getTextFromUIMessage = (
  message: UIMessage,
  options?: TextExtractionOptions
): string => {
  const includeToolText = options?.includeToolText ?? false
  const maxChars = options?.maxCharsPerMessage ?? DEFAULT_MAX_CHARS_PER_MESSAGE
  const segments: string[] = []

  for (const part of message.parts) {
    const record = asRecord(part)
    if (!record) continue

    if (record.type === "text" && typeof record.text === "string") {
      segments.push(record.text)
      continue
    }

    if (includeToolText) {
      if (typeof record.text === "string") {
        segments.push(record.text)
        continue
      }
      if (record.type === "tool-result" && record.output !== undefined) {
        const value = stringifyIfShort(record.output, maxChars)
        if (value) segments.push(value)
      }
    }
  }

  return clampText(segments.join("\n").trim(), maxChars)
}

export const getInitialUserText = (messages: UIMessage[]): string => {
  for (const message of messages) {
    if (message.role !== "user") continue
    const text = getTextFromUIMessage(message)
    if (text) return text
  }
  return ""
}

export const getLatestUserMessage = (
  messages: UIMessage[],
  preferredMessageId?: string
): UIMessage | null => {
  if (preferredMessageId) {
    const preferred = messages.find(
      (message) => message.id === preferredMessageId && message.role === "user"
    )
    if (preferred) return preferred
  }

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index].role === "user") {
      return messages[index]
    }
  }
  return null
}
