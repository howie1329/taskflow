# Summarization Model

This package supports rolling summarization through a deterministic planning API.

## Terms

- `previousSummary`: previously persisted rolling summary state
- `cursor`: `summarizedThroughMessageId`, the last message already summarized
- `keepLastN`: newest messages protected from summarization

## Trigger Modes

- `tokens`: summarize when estimated tokens exceed `maxTokens`
- `messages`: summarize when total messages exceed `maxMessages`
- `either`: summarize when either threshold is exceeded

## Algorithm

1. Compute current token estimate from the full message list.
2. Split messages into:
   - candidate segment (`all except protected tail`)
   - protected tail (`last keepLastN`)
3. Resolve cursor in candidate segment.
4. Select summarize slice:
   - if cursor exists: messages after cursor
   - if cursor missing: summarize from start of candidate segment
5. If threshold not met or slice empty, return `shouldSummarize = false`.
6. If threshold met and slice non-empty, return:
   - `messagesToSummarize`
   - `messagesToKeep` (protected tail)
   - `nextCursorMessageId` (last summarized message id)

## Summarizer Contract

The package does not call an LLM. The app should:

- Format `messagesToSummarize` using `formatMessagesForSummarizer`
- Pass:
  - previous summary text (if any)
  - transcript
- Receive updated summary text
- Persist as `ThreadSummaryState`

Recommended prompt constraints:

- Preserve decisions, user preferences, open tasks, unresolved questions
- Avoid copying raw tool payload dumps
- Keep concise and structured for downstream model context
