# @taskflow/rag

A TypeScript package for token estimation and context management in Retrieval-Augmented Generation (RAG) workflows and LLM-based applications. Provides accurate token counting and context window management utilities for chat messages, structured content, and conversation summarization.

## Features

- **Token Estimation**: Accurate token counting for strings and structured message arrays
- **Context Management**: Check if content fits within model token limits
- **Message Processing**: Support for standard chat messages and advanced pruned message structures
- **Conversation Analysis**: Determine when conversations should be summarized
- **TypeScript Support**: Full type definitions included
- **Zero Dependencies**: Built on `gpt-tokenizer` for reliable token counting

## Installation

```bash
npm install @taskflow/rag
```

## Quick Start

```typescript
import {
  estimateTokens,
  estimateTokensFromMessages,
  summarizeConversation,
  tokenService,
} from "@taskflow/rag";

// Estimate tokens for plain text
const result = estimateTokens("Hello, world!");
console.log(result.tokenCount); // e.g., 3
console.log(result.isWithinLimit); // true/false

// Estimate tokens for chat messages
const messages = [
  { role: "user", content: "What is RAG?" },
  {
    role: "assistant",
    content: "RAG stands for Retrieval-Augmented Generation...",
  },
];
const estimate = estimateTokensFromMessages(messages, 8000);
console.log(estimate.tokenCount, estimate.isWithinLimit);

// Check if conversation should be summarized
const { estimatedTokens, shouldSummarize } = summarizeConversation(
  messages,
  2000
);
if (shouldSummarize) {
  console.log(
    `Conversation has ${estimatedTokens} tokens and should be summarized`
  );
}
```

## API Reference

### `estimateTokens(content, tokenLimit?)`

Estimates the number of tokens in a string and checks if it fits within a token limit.

**Parameters:**

- `content` (string): The text content to estimate tokens for
- `tokenLimit` (number, optional): Maximum token limit. Defaults to `8000`

**Returns:** `TokenEstimate`

```typescript
{
  tokenCount: number;      // Total number of tokens
  tokens: unknown[];      // Array of encoded tokens
  isWithinLimit: boolean;  // Whether content fits within limit
}
```

**Example:**

```typescript
const result = estimateTokens("This is a test message", 100);
console.log(result.tokenCount); // 5
console.log(result.isWithinLimit); // true
```

---

### `estimateTokensFromMessages(messages, tokenLimit?)`

Estimates token usage for an array of chat messages (user, assistant, system, tool roles).

**Parameters:**

- `messages` (`ChatMessage[]`): Array of chat messages
- `tokenLimit` (number, optional): Maximum token limit. Defaults to `8000`

**Returns:** `TokenEstimate`

**Message Format:**

```typescript
type ChatMessage = {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
};
```

**Example:**

```typescript
const messages: ChatMessage[] = [
  { role: "user", content: "Tell me about TypeScript" },
  {
    role: "assistant",
    content: "TypeScript is a typed superset of JavaScript...",
  },
  { role: "system", content: "You are a helpful assistant." },
];

const estimate = estimateTokensFromMessages(messages, 4000);
if (!estimate.isWithinLimit) {
  console.warn(`Messages exceed limit: ${estimate.tokenCount} tokens`);
}
```

---

### `estimateTokensFromPrunedMessages(prunedMessages, tokenLimit?)`

Estimates tokens for advanced pruned message structures that include reasoning, tool calls, and tool results.

**Parameters:**

- `prunedMessages` (`PrunedMessage[]`): Array of pruned messages with structured content
- `tokenLimit` (number, optional): Maximum token limit. Defaults to `8000`

**Returns:** `EstimateTokensFromPrunedMessagesResult`

```typescript
{
  totalTokens: number; // Total token count across all messages
  isWithinLimit: boolean; // Whether total fits within limit
}
```

**Pruned Message Format:**

```typescript
type PrunedMessage = {
  role: "user" | "assistant" | "system" | "tool";
  content: PrunedContent[];
};

type PrunedContent =
  | { type: "text"; text: string }
  | { type: "reasoning"; text: string }
  | { type: "tool-call"; input: { query: string } }
  | { type: "tool-result"; output: { value: string } };
```

**Example:**

```typescript
const prunedMessages: PrunedMessage[] = [
  {
    role: "user",
    content: [
      { type: "text", text: "Search for information about AI" },
      { type: "tool-call", input: { query: "artificial intelligence" } },
    ],
  },
  {
    role: "assistant",
    content: [
      { type: "tool-result", output: { value: "AI is..." } },
      { type: "text", text: "Here's what I found..." },
    ],
  },
];

const result = estimateTokensFromPrunedMessages(prunedMessages, 8000);
console.log(`Total tokens: ${result.totalTokens}`);
```

---

### `summarizeConversation(messages, tokenLimit?)`

Determines if a conversation should be summarized based on token count. Useful for managing long conversations that approach context limits.

**Parameters:**

- `messages` (`ChatMessage[]`): Array of chat messages
- `tokenLimit` (number, optional): Token threshold for summarization. Defaults to `2000`

**Returns:** `SummarizeConversationResult`

```typescript
{
  estimatedTokens: number; // Total tokens in conversation
  shouldSummarize: boolean; // Whether summarization is recommended
}
```

**Example:**

```typescript
const messages: ChatMessage[] = [
  // ... long conversation history
];

const { estimatedTokens, shouldSummarize } = summarizeConversation(
  messages,
  2000
);

if (shouldSummarize) {
  // Trigger summarization logic
  console.log(`Conversation has ${estimatedTokens} tokens, summarizing...`);
}
```

---

### `tokenService`

A convenience object that provides access to all token estimation functions.

**Properties:**

- `estimateTokens`
- `estimateTokensFromMessages`
- `estimateTokensFromPrunedMessages`

**Example:**

```typescript
import { tokenService } from "@taskflow/rag";

const result = tokenService.estimateTokens("Hello");
const messageResult = tokenService.estimateTokensFromMessages(messages);
```

## TypeScript Support

This package is written in TypeScript and includes comprehensive type definitions. All exported functions and types are fully typed.

**Exported Types:**

- `TokenEstimate`
- `EstimateTokensFromPrunedMessagesResult`
- `SummarizeConversationResult`
- `ChatMessage`
- `ChatMessageRole`
- `PrunedMessage`
- `PrunedContent`
- `TokenService`

## Use Cases

### Context Window Management

```typescript
import { estimateTokensFromMessages } from "@taskflow/rag";

function prepareContext(messages: ChatMessage[], modelLimit: number) {
  const estimate = estimateTokensFromMessages(messages, modelLimit);

  if (!estimate.isWithinLimit) {
    // Implement pruning or summarization logic
    return pruneMessages(messages, modelLimit);
  }

  return messages;
}
```

### RAG Pipeline Integration

```typescript
import { estimateTokens, summarizeConversation } from "@taskflow/rag";

async function processQuery(
  query: string,
  context: string[],
  modelLimit: number
) {
  // Estimate tokens for query
  const queryTokens = estimateTokens(query);

  // Estimate tokens for retrieved context
  const contextTokens = estimateTokens(context.join("\n"));

  // Check if we need to truncate context
  const totalTokens = queryTokens.tokenCount + contextTokens.tokenCount;
  if (totalTokens > modelLimit) {
    // Truncate context to fit
    return truncateContext(context, modelLimit - queryTokens.tokenCount);
  }

  return context;
}
```

### Conversation History Management

```typescript
import { summarizeConversation } from "@taskflow/rag";

function manageConversationHistory(messages: ChatMessage[]) {
  const { estimatedTokens, shouldSummarize } = summarizeConversation(
    messages,
    2000
  );

  if (shouldSummarize) {
    // Summarize older messages and keep recent ones
    const summary = await summarizeMessages(messages.slice(0, -5));
    return [
      { role: "system", content: `Previous conversation summary: ${summary}` },
      ...messages.slice(-5), // Keep last 5 messages
    ];
  }

  return messages;
}
```

## Dependencies

- `gpt-tokenizer` (^3.4.0): Used for accurate GPT token counting

## Development

```bash
# Build the package
npm run build

# Clean build artifacts
npm run clean

# Build before publishing (runs automatically on prepack)
npm run prepack
```

## License

MIT

## Author

Howard Thomas
