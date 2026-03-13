# Chat Context Compaction — Implementation Plan

## 1. Current Chat Flow (Brief)

1. **Frontend:** `useChat` from `@ai-sdk/react` sends messages to `/api/chat` (default route). `ChatProvider` wraps the chat layout; `sendPrompt` sends messages with `model`, `userId`, `projectId`, `mode`, `toolLock` in the body.
2. **API route:** `POST /api/chat` receives `messages`, `id` (threadId), `messageId`. It:
   - Parses/normalizes messages via `@taskflow/chat-content`
   - Fetches thread from Convex
   - Runs `planSummarization` → if triggered, `formatMessagesForSummarizer` → `createRollingSummary` (Gemini) → `setThreadSummary` (Convex)
   - Uses `injectRollingSummary` to prepend system message with summary
   - Converts to model messages, prunes, then streams via `createUIMessageStream`
3. **Storage:** Convex `thread` table has `summary`, `threadMessages` table has messages.
4. **UI:** `ThreadContextFooterBadge` and `ChatInspector` show/edit the rolling summary.

---

## 2. Files to Change

| File | Change |
|------|--------|
| `apps/web/convex/schema.ts` | Extend `thread.summary` → add `threadState`, `compactionMetadata` |
| `apps/web/convex/chat.ts` | Update `setThreadSummary`; add `compactThread` mutation (or extend `setThreadSummary`) |
| `apps/web/app/api/chat/route.ts` | Replace summarization with new compaction logic |
| `apps/web/lib/chat/context-compaction/` | **New** — compaction utilities |
| `apps/web/app/app/chat/[threadId]/components/thread-context-footer-badge.tsx` | Show compact status, last compacted |
| `apps/web/components/app/inspector/chat-inspector.tsx` | Update Memory tab for new state; add compact status |
| `apps/web/app/app/chat/[threadId]/components/thread-composer-bar.tsx` | Add "Compact chat" action |
| `apps/web/app/app/chat/[threadId]/components/thread-header.tsx` | Optional: add Compact to dropdown menu |

---

## 3. Implementation Plan

### Phase 1: Domain / Backend Logic

**1.1 Create `lib/chat/context-compaction/`**

- `types.ts` — `ThreadState`, `CompactionConfig`, `CompactionMetadata`, `CompactionPlan`
- `config.ts` — `DEFAULT_COMPACTION_CONFIG` (recentMessageCount: 8, messageThreshold: 20, tokenThreshold: 10000, minTranscriptChars: 180, maxSummaryChars: 2800)
- `thresholds.ts` — `estimateMessageTokens(messages)`, `shouldCompactByMessageCount(...)`, `shouldCompactByTokenCount(...)`
- `planning.ts` — `planCompaction(messages, previousSummary, config)` — returns `shouldCompact`, `messagesToSummarize`, `messagesToKeep`, `nextCursorMessageId`
- `formatting.ts` — `formatMessagesForSummarizer(messages, options)` — reuse from `@taskflow/chat-content` or inline
- `generation.ts` — `generateThreadSummary(...)`, `generateStructuredThreadState(...)` — both call Gemini with structured prompts
- `assembly.ts` — `assemblePromptContext(summary, threadState, messagesToKeep)` — builds final prompt structure

**1.2 Convex schema**

- Extend `thread.summary` → `thread.compaction` or keep `summary` and add:
  - `threadState` (structured JSON)
  - `compactionMetadata` (lastCompactedAt, lastCompactedMessageId, messageCountAtCompaction, tokenEstimateAtCompaction)

**1.3 Convex mutations**

- `setThreadCompaction` — sets summary + threadState + compactionMetadata
- Add `compactThread` action (or API route) for manual compaction — fetches messages, runs compaction, updates Convex

### Phase 2: API Route Integration

**2.1 Replace summarization in `/api/chat/route.ts`**

- Remove `planSummarization`, `formatMessagesForSummarizer`, `injectRollingSummary` from `@taskflow/chat-content`
- Use new `planCompaction`, `generateThreadSummary`, `generateStructuredThreadState`, `assemblePromptContext`
- Add `compactManually` body param — when true, force compaction before model call
- Add debounce: only compact if `lastCompactedAt` was > N minutes ago (e.g. 2 min) or manual

### Phase 3: Manual Compaction UX

**3.1 API route for manual compact**

- Option A: Add `compactManually: true` to POST body when user clicks Compact
- Option B: New POST `/api/chat/compact` route that compacts and returns; frontend calls it then refresh

**3.2 Frontend**

- Add "Compact chat" to ThreadHeader dropdown or ThreadComposerBar
- On click: call Compact API; on success: toast "Chat compacted"; Convex refetches thread

### Phase 4: Auto-Compaction in Send Pipeline

- In POST `/api/chat`, before model call:
  - If `compactManually` → always run compaction
  - Else: run `planCompaction`; if `shouldCompact` and (message or token threshold) → run compaction
  - Use `assemblePromptContext` for final prompt assembly

### Phase 5: UI Updates

- `ThreadContextFooterBadge`: show "Compacted" / "Not compacted", last compacted time
- `ChatInspector` Memory tab: show structured thread state + summary; editable summary; compact status
- Dev mode: optional debug info (raw message count, token estimate, threshold status)

### Phase 6: Logging / Debug

- Add `console.debug` in development for compaction decisions
- Optional: `DEBUG_COMPACTION=true` env to log plan, tokens, thresholds

---

## 4. Data Structures

```ts
// ThreadState (structured memory)
type ThreadState = {
  activeGoal?: string
  currentTopic?: string
  importantFacts: string[]
  decisions: string[]
  unresolvedItems: string[]
  referencedEntities: string[]
  userPreferences: string[]
  recentToolFindings: string[]
  warningsOrRisks: string[]
}

// CompactionMetadata
type CompactionMetadata = {
  lastCompactedAt: number
  lastCompactedMessageId: string
  messageCountAtCompaction: number
  tokenEstimateAtCompaction?: number
}

// Persisted on thread
type ThreadCompaction = {
  schemaVersion: 1
  summaryText: string
  threadState: ThreadState
  summarizedThroughMessageId: string
  compactionMetadata: CompactionMetadata
  updatedAt: number
}
```

---

## 5. Tradeoffs & Next Steps

- **Structured state vs. prose-only:** Structured state adds complexity but improves prompt quality. Start with both; can simplify later.
- **Manual vs auto:** Manual gives user control; auto prevents surprise. Support both.
- **Package:** Keep logic in `apps/web/lib/chat/` — no need to extend `@taskflow/chat-content` unless we want to share with other apps.
- **Debouncing:** 2–5 min cooldown prevents rapid re-compaction on burst sends.
- **Fallback:** If compaction fails, continue with recent raw window only; log error.

---

## 6. Execution Order

1. Create `lib/chat/context-compaction/` with types, config, thresholds, planning
2. Add generation (summary + threadState) and assembly
3. Convex schema + migration + update `setThreadSummary` → `setThreadCompaction`
4. Replace summarization in API route with new compaction
5. Add manual compact API path + frontend button
6. Update ThreadContextFooterBadge + ChatInspector
7. Add debug logging
