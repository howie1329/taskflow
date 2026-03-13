import { encode } from "gpt-tokenizer"
import type { UIMessage } from "ai"
import type { TextExtractionOptions } from "./types.js"
import { getTextFromUIMessage } from "./text.js"

export const estimateTokensFromText = (text: string): number => {
  return encode(text).length
}

export const estimateTokensFromUIMessages = (
  messages: UIMessage[],
  options?: TextExtractionOptions
): number => {
  const transcript = messages
    .map((message) => getTextFromUIMessage(message, options))
    .filter(Boolean)
    .join("\n")

  if (!transcript) return 0
  return estimateTokensFromText(transcript)
}
