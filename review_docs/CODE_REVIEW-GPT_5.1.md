## Taskflow RAG Code Review (Dec 27, 2025)

### Findings (ordered by severity)

- Bug – message token counts are likely wrong: `countTokens(messages)` and `isWithinTokenLimit(messages, tokenLimit)` take an array instead of counted tokens, so message limits can be mis-reported. Use the encoded length from `encodeChat` instead.

```48:58:src/core/index.ts
export const estimateTokensFromMessages = (messages: ChatMessage[], tokenLimit = 8000): TokenEstimate => {
  try {
    const messagesTokens = encodeChat(messages);
    // const messageTokenCount = countChatCompletionTokens(messages); // This is the correct way to count tokens for chat completions
    const messageTokenCount = countTokens(messages);
    const isWithinLimit = isWithinTokenLimit(messages, tokenLimit);
```

- Bug – `summarizeConversation` returns `shouldSummarize` as “within limit,” so it recommends summarizing only when there is _no_ pressure on the context window. It likely needs a `>= tokenLimit` or `!isWithinTokenLimit` check.

```121:128:src/core/index.ts
export const summarizeConversation = (messages: ChatMessage[], tokenLimit: number = 2000): SummarizeConversationResult=> {
  try {
    const estimatedTokens = countTokens(messages);
    const shouldSummarize = isWithinTokenLimit(messages, tokenLimit);
```

- Bug – types don’t match runtime: `isWithinLimit` and `shouldSummarize` are typed as `number | boolean` but only ever return booleans, weakening type-safety for callers.

```1:15:src/types.ts
export type TokenEstimate = {
    tokenCount: number
    tokens: unknown[]
    isWithinLimit:  number | boolean
}
...
export type SummarizeConversationResult = {
    estimatedTokens: number
    shouldSummarize: number | boolean
}
```

- Correctness risk – `MessageContextSlicer` may slice from a negative index if `sliceIndex` exceeds `messageIndex`, and silently returns all messages when `messageIndex <= 6`, making its behavior unpredictable for early histories. Add bounds checks.

```146:156:src/core/index.ts
export const MessageContextSlicer = (messageSummaries: MessageSummary[], currentMessages: ChatMessageFromDB[],sliceIndex: number) => {
  try {
    if (messageSummaries.length > 0 && messageSummaries[messageSummaries.length - 1].messageIndex > 6) {
      const lastSummary = messageSummaries[messageSummaries.length - 1];
      return currentMessages.slice(lastSummary.messageIndex - sliceIndex);
```

- Minor – token accumulation for summaries adds `messageEndTokens`, which may already be cumulative; verify whether you need per-summary increments or a single end marker.

```166:181:src/core/index.ts
export const formatSummarizedMessageHistory = (messageSummaries: MessageSummary[]): { formattedMessageHistory: string, conversationSummaryTokens: number } => {
  try {
    let formattedMessageHistory = "";
    let conversationSummaryTokens = 0;
    if (messageSummaries.length > 0) {
      for (const messageSummary of messageSummaries) {
        conversationSummaryTokens += messageSummary.messageEndTokens;
      }
```

- Quality gap – no automated tests; `npm test` exits 1 by design. Hard to trust token math without fixtures.
- Docs inconsistency – README advertises “Zero Dependencies” but the package depends on `gpt-tokenizer`.

### What’s working well

- Clean, small surface area with re-exports from `src/index.ts`.
- Strict TypeScript config (`strict: true`) and declaration maps enabled for consumers.
- Defensive error handling returns safe defaults instead of throwing.

### Concrete improvements with examples

- Fix message token counting to use the encoded length and limit checks on numbers, not arrays:

```typescript
const messagesTokens = encodeChat(messages);
const messageTokenCount = messagesTokens.length;
const isWithinLimit = messageTokenCount <= tokenLimit;
```

- Make summarization signal pressure, not safety:

```typescript
const estimatedTokens = encodeChat(messages).length;
const shouldSummarize = estimatedTokens >= tokenLimit; // or !isWithinTokenLimit(...)
```

- Align types to actual values: change `isWithinLimit` and `shouldSummarize` to `boolean`, and type `tokens` as `Uint32Array | number[]` to match `gpt-tokenizer`.
- Guard the context slicer: clamp `sliceIndex` to `>= 0` and `<= messageIndex`, and return a fixed window (e.g., last `sliceIndex` messages) when there is no prior summary.
- Add focused tests: table-driven cases for strings, chat messages, pruned messages, and summarization thresholds to prevent regressions in token math.

### Things to think about

- Decide whether `countTokens` from `gpt-tokenizer` is appropriate for objects; prefer working off encoded lengths or string joins to avoid silent coercion.
- Expose model-specific defaults (e.g., 8k/32k/128k) so callers don’t have to remember limits.
- Consider surfacing both raw token counts and “remaining tokens” to simplify downstream truncation.
