import { encode } from "gpt-tokenizer"
import type { UIMessage } from "ai"
import type { SummarizationOptions } from "./types.js"
import { getTextFromUIMessage } from "./text.js"

export const estimateTokensFromText = (text: string): number => {
  return encode(text).length
}

export const estimateTokensFromUIMessages = (
  messages: UIMessage[],
  options?: Pick<
    SummarizationOptions,
    "includeToolText" | "maxCharsPerMessage"
  >
): number => {
  const transcript = messages
    .map((message) => getTextFromUIMessage(message, options))
    .filter(Boolean)
    .join("\n")

  if (!transcript) return 0
  return estimateTokensFromText(transcript)
}
