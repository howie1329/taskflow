# @taskflow/chat-content

Pure TypeScript utilities for AI chat content validation, normalization, token estimation, and summarization planning.

## What This Package Does

- Validates and normalizes Vercel AI SDK `UIMessage[]` payloads
- Makes message parts JSON-serializable for safe persistence
- Estimates token usage with `gpt-tokenizer`
- Plans rolling summarization using message count and/or token thresholds
- Injects persisted rolling summaries into model context as a system message

## Non-Goals

- No database writes or adapters
- No direct LLM calls for summarization
- No retention/compaction policies
- No search indexing helpers

## Installation

```bash
npm install @taskflow/chat-content
```

## Quick Start

```ts
import {
  safeParseUIMessages,
  normalizeUIMessages,
  planSummarization,
  formatMessagesForSummarizer,
  injectRollingSummary,
} from "@taskflow/chat-content"

const parsed = safeParseUIMessages(body.messages)
if (!parsed.success) {
  throw new Error("Invalid messages payload")
}

const messages = normalizeUIMessages(parsed.data)

const plan = planSummarization({
  messages,
  previousSummary: thread.summary ?? null,
  options: {
    trigger: { kind: "either", maxTokens: 12000, maxMessages: 40 },
    keepLastN: 6,
  },
})

if (plan.shouldSummarize) {
  const transcript = formatMessagesForSummarizer(plan.messagesToSummarize)
  const summaryText = await summarizeWithModel(transcript, thread.summary?.summaryText)
  const contextMessages = injectRollingSummary({
    summaryText,
    messagesToKeep: plan.messagesToKeep,
  })
  // Continue with convertToModelMessages(contextMessages)
}
```

## API Overview

### Validation

- `parseUIMessages(input)`
- `safeParseUIMessages(input)`
- `normalizeUIMessages(messages)`
- `toStoredThreadMessage(message, meta)`
- `fromStoredThreadMessage(storedMessage)`

### Serialization

- `assertJsonSerializable(value)`
- `makeJsonSerializable(value)`
- `ChatContentError`

### Text

- `getTextFromUIMessage(message, options?)`
- `getInitialUserText(messages)`
- `getLatestUserMessage(messages, preferredMessageId?)`

### Tokens

- `estimateTokensFromText(text)`
- `estimateTokensFromUIMessages(messages, options?)`

### Summarization

- `planSummarization({ messages, previousSummary, options })`
- `formatMessagesForSummarizer(messages, options?)`
- `injectRollingSummary({ summaryText, messagesToKeep })`

## Summarization Notes

- Rolling summary uses a cursor: `summarizedThroughMessageId`
- `keepLastN` messages are never summarized
- Trigger can be:
  - `tokens`
  - `messages`
  - `either`

See `docs/SUMMARIZATION.md` and `docs/INTEGRATION_TASKFLOW_WEB.md` for full flow details.
