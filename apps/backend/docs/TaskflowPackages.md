# Taskflow Packages: `@taskflow/rag` vs `@taskflow/user-context` (or `@taskflow/user-context-rag`)

This doc defines **what belongs in each package**, with a clean boundary between:

- **Pure, reusable RAG utilities** (`@taskflow/rag`)
- **The real user-context system** (DB + embeddings + retrieval + jobs) (`@taskflow/user-context`)

---

## Goals

- Keep `@taskflow/rag` **small, stable, and reusable** across apps.
- Put all **IO/orchestration** (DB, pgvector, Redis, BullMQ, provider calls) into `@taskflow/user-context`.
- Make boundaries obvious so refactors are easy and testing is simple.

---

## Package 1: `@taskflow/rag` (Pure “RAG math + policy” utilities)

### What it is

A **pure utility package**: token counting, token budgeting, context window planning, and summarization **decision logic**.

### Hard rules (what MUST NOT be inside)

- No Express / HTTP (`req`, `res`)
- No DB / ORM (Postgres, pgvector, Drizzle)
- No queues (BullMQ)
- No caches (Redis)
- No LLM provider clients / SDK glue (OpenRouter, `ai` streaming, etc.)
- No app schemas (tasks/notes/messages tables)

### What it SHOULD include

#### Tokenization

- `estimateTokens(text, tokenLimit?)`
- `estimateTokensFromMessages(messages, tokenLimit?)`
- `estimateTokensFromPrunedMessages(prunedMessages, tokenLimit?)`
- Model token-limit registry (data only)
- Optional cost helpers:
  - tokens → cost, by model (registry + pure math)

#### Budgets / planning

- `createTokenBudget({ model, maxContext, reserveForSystem, reserveForTools, reserveForAnswer, safetyMargin })`
- `computeTokenBreakdown({ systemPrompt, historyMessages, retrievedContext, toolDefinitions })`
- `isWithinBudget(plan)`
- `explainOverflow(plan)` (debug-friendly output)

#### Context window selection (no IO)

- `selectRecentMessages(messages, keepN)`
- `selectMessagesByTokenBudget(messages, { keepRecent, budgetTokens })`
- Return a plan object such as:
  - `{ selectedHistory, droppedHistory, totals }`

#### Summarization policy (decision only)

- Threshold tables per model:
  - `{ K, T, COOLDOWN, KEEP_RECENT }`
- `shouldSummarize({ totalMessages, lastSummarizedIndex, tokensSinceLastSummary, thresholds })`
- `computeSummaryDelta({ messages, lastSummaryCutoff })` (choose what should be summarized)

#### Context formatting (pure transforms)

- `formatRetrievedContext({ tasks, notes, messages })` into a stable prompt-friendly shape
- Truncation / redaction helpers (pure transforms)
- Dedup helpers (by id/content hash)

#### Validation & types

- Types (`index.d.ts`) for:
  - Message shapes
  - Retrieved context shapes
  - Budget / plan shapes
- Optional `zod` schemas for validation (pure)

#### Developer ergonomics

- Debug helpers: `describePlan(plan)` for logs
- Test fixtures for token edge cases (no DB)

---

## Package 2: `@taskflow/user-context` (or `@taskflow/user-context-rag`) (User context system)

### What it is

A **system package** that actually builds and maintains user context:

- embeddings
- retrieval over tasks/notes/messages
- summarization execution + storage
- caching + jobs
- DB operations

This package **can depend on IO**, and it should call into `@taskflow/rag` for policy/budgeting/selection.

### What it SHOULD include

#### Embedding

- `EmbeddingService`
  - create embeddings (provider-agnostic interface)
  - batch embedding utilities
  - chunking/splitting strategies (tasks/notes/messages)
  - content normalization rules (what gets embedded)
- Provider adapters:
  - Gemini / OpenAI / etc.
- Embedding configuration:
  - model names, dimensions, batching, rate limits

#### Vector search / retrieval

- `ContextRetrievalService`
  - search tasks/notes/messages by embedding similarity
  - scoring/ranking/merging across sources
  - filters (recency, project, tags, type)
  - caching retrieval results (optional)
- Context aggregation:
  - unify results into a single “retrieved context” object

#### Conversation summarization (execution + persistence)

- `SummarizationService`
  - decide (via `@taskflow/rag` policy)
  - run summarization LLM calls
  - merge/update summaries
  - store summary updates
- Optional background summarization pipelines

#### Context windowing (execution wrapper)

- `ContextWindowService`
  - uses `@taskflow/rag` selection logic
  - integrates:
    - summary
    - retrieved context
    - conversation history
  - outputs the final “prompt payload” for the chat agent

#### Database layer

- `ContextOperations` / repositories:
  - `searchTasksVector(userId, embedding, limit)`
  - `searchNotesVector(...)`
  - `searchMessagesVector(...)`
  - `updateEmbedding(entityId, vector)`
  - `updateConversationSummary(conversationId, summary)`
- Optional schema ownership:
  - migrations for vector columns/indexes if this package owns schema changes

#### Jobs / queues

- BullMQ workers:
  - embed message/task/note jobs
  - summarize conversation jobs
  - backfills / re-embed on model change
- Retry/backoff + dead-letter handling

#### Caching

- Redis cache for:
  - retrieval results
  - summaries
  - per-conversation “context snapshot”
- Invalidation rules (on task/note/message update)

#### Observability

- structured logging for:
  - retrieval latency
  - token usage
  - cache hit rate
- metrics hooks (timers, counters)

#### Security / privacy

- strict userId scoping on all queries
- redaction rules for sensitive fields
- optional audit logs for context access

### Public API surface (examples)

- `buildUserContext({ userId, message, settings })`
- `retrieveContext({ userId, query, sources })`
- `maybeSummarizeConversation({ conversationId, userId })`

---

## How the packages interact

- `@taskflow/user-context` does IO + orchestration and calls `@taskflow/rag` for:
  - token budgeting
  - context window selection
  - summarization decision policy

### One-line rule

- `@taskflow/rag` decides **what should fit** and **when to summarize**.
- `@taskflow/user-context` fetches/stores **the actual context** and runs **retrieval + summarization**.

---

## Practical mapping to your current backend

- Controllers stay thin:
  - parse request → call backend service → stream response
- Backend AI services stay provider-aware:
  - OpenRouter / Vercel AI SDK streaming logic
- `@taskflow/rag` stays provider-agnostic and testable.
- `@taskflow/user-context` centralizes:
  - embeddings + retrieval + summary + jobs + DB ops.

---

## Naming recommendation

- Keep `@taskflow/rag` as the small utility package.
- Use `@taskflow/user-context` (or `@taskflow/user-context-rag`) for the bigger system package.

Pick:

- `@taskflow/user-context` if you expect it to grow beyond “RAG” (policies, permissions, analytics).
- `@taskflow/user-context-rag` if it’s strictly tied to embeddings/retrieval/summarization.

---
