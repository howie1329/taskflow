# @taskflow/chat-content

Pure TypeScript utilities for AI chat content validation, normalization, and token estimation.

## What This Package Does

- Validates and normalizes Vercel AI SDK `UIMessage[]` payloads
- Makes message parts JSON-serializable for safe persistence
- Estimates token usage with `gpt-tokenizer`
- Extracts text from messages for downstream processing

## Non-Goals

- No database writes or adapters
- No direct LLM calls
- No summarization or compaction logic (handled by app layer)

## Installation

```bash
npm install @taskflow/chat-content
```

## Quick Start

```ts
import {
  safeParseUIMessages,
  normalizeUIMessages,
  getLatestUserMessage,
  estimateTokensFromUIMessages,
  fromStoredThreadMessage,
} from "@taskflow/chat-content"

const parsed = safeParseUIMessages(body.messages)
if (!parsed.success) throw new Error("Invalid messages payload")

const messages = normalizeUIMessages(parsed.data)
const tokenCount = estimateTokensFromUIMessages(messages)
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
