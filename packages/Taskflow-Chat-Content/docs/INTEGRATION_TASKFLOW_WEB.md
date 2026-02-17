# Integration: Taskflow Web

This package is intended for `apps/web` route and Convex integration.

## Route Integration

Primary file: `apps/web/app/api/chat/route.ts`

Recommended order:

1. Parse and validate `body.messages` with `safeParseUIMessages`.
2. Normalize with `normalizeUIMessages`.
3. Build plan with `planSummarization` using configured thresholds.
4. If `plan.shouldSummarize`:
   - format transcript with `formatMessagesForSummarizer`
   - call summarizer model in route
   - persist summary to `thread.summary` via Convex mutation
5. Build context with `injectRollingSummary` and continue existing model call path.

## Convex Data Shape

Recommended `thread.summary` shape:

```ts
{
  schemaVersion: 1,
  summaryText: string,
  summarizedThroughMessageId: string,
  updatedAt: number
}
```

## Default Runtime Values

- `keepLastN: 6`
- Trigger:
  - token-first default: `{ kind: "tokens", maxTokens: 12000 }`
  - dual threshold option: `{ kind: "either", maxTokens: 12000, maxMessages: 40 }`
- `includeToolText: false`
