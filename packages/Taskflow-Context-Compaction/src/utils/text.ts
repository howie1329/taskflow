import type { UIMessage } from "ai"

export type TextExtractionOptions = {
  includeToolText?: boolean
  maxCharsPerMessage?: number
}

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

export function getTextFromUIMessage(
  message: UIMessage,
  options?: TextExtractionOptions
): string {
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
