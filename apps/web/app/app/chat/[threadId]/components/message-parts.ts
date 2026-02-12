import type { UIMessage } from "ai"

export function getMessageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("")
}

export function getMessageReasoning(message: UIMessage): string | null {
  const reasoningParts = message.parts.filter((part) => part.type === "reasoning")
  if (reasoningParts.length === 0) return null

  return reasoningParts
    .map((part) => (part as { type: "reasoning"; text: string }).text)
    .join("")
}
