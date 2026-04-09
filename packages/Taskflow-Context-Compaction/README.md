# @taskflow/context-compaction

Chat context compaction and summarization for Taskflow. Keeps long conversations within model context limits by summarizing older messages into a rolling summary and structured thread state.

## Installation

```bash
npm install @taskflow/context-compaction
```

## What This Package Does

- **Planning:** Decide when to compact (message count, token threshold, or manual)
- **Formatting:** Convert messages to transcript for the summarizer
- **Generation:** Produce rolling summary and structured thread state (requires a model from your app)
- **Assembly:** Build final prompt context (summary + state + recent messages)

## Usage

```ts
import {
  planCompaction,
  formatMessagesForSummarizer,
  generateThreadSummary,
  generateStructuredThreadState,
  assemblePromptContext,
  DEFAULT_COMPACTION_CONFIG,
  isPastCompactionCooldown,
} from "@taskflow/context-compaction"
import { createGoogleGenerativeAI } from "@ai-sdk/google"

const model = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_AI_KEY })(
  "gemini-3.1-flash-lite-preview"
)

const plan = planCompaction({
  messages,
  previousCompaction,
  config: DEFAULT_COMPACTION_CONFIG,
  forceManual: false,
})

if (plan.shouldCompact && plan.messagesToSummarize.length > 0) {
  const transcript = formatMessagesForSummarizer(plan.messagesToSummarize)
  const [summary, state] = await Promise.all([
    generateThreadSummary({ model, previousSummary, transcript, maxSummaryChars: 2800 }),
    generateStructuredThreadState({ model, previousState, transcript }),
  ])
  // Persist summary, state, plan.nextCursorMessageId
}

const context = assemblePromptContext({
  summaryText,
  threadState,
  messagesToKeep,
})
```

## API

### Planning

- `planCompaction({ messages, previousCompaction, config, forceManual? })` — Returns compaction plan
- `selectContextMessages({ messages, summarizedThroughMessageId, recentMessageCount })` — Trim context by cursor
- `formatMessagesForSummarizer(messages, options?)` — Build transcript string
- `isPastCompactionCooldown(lastCompactedAt, config)` — Check cooldown for auto-compaction

### Generation (requires model from your app)

- `generateThreadSummary({ model, previousSummary, transcript, maxSummaryChars })` — Rolling markdown summary
- `generateStructuredThreadState({ model, previousState, transcript })` — Structured ThreadState

### Assembly

- `assemblePromptContext({ summaryText, threadState, messagesToKeep })` — Build UIMessage[] for model

### Utilities

- `getTextFromUIMessage(message, options?)` — Extract text from UIMessage
- `estimateTokensFromUIMessages(messages, options?)` — Token estimate via gpt-tokenizer
- `estimateTokensFromText(text)` — Token count for a string

## Dependencies

- `ai` — UIMessage, generateText, Output
- `gpt-tokenizer` — Token estimation
- `zod` — ThreadState schema
