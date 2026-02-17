# Design Decisions

## Canonical Message Type

Use Vercel AI SDK `UIMessage` as the canonical in-memory representation to match existing `apps/web` chat flows.

## Package Boundary

Keep the package as pure utilities:

- no DB adapters
- no LLM calls
- no framework-specific runtime dependencies

This keeps the package easy to test, reuse, and adopt incrementally.

## Summarization Strategy

Use rolling summary with cursor (`summarizedThroughMessageId`) so summarization can be incremental and avoids repeatedly summarizing old history.

## Trigger Strategy

Support message count and token triggers with `either` mode. Default recommendation remains token-based to align with model context limits.

## Token Estimation

Use `gpt-tokenizer` for approximate token estimation. Token count is a trigger heuristic and may differ from provider billing/token accounting.
