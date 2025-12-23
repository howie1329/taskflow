## Taskflow Research + Daily Digest (Product + Technical Plan)

### TL;DR

Add two user-facing capabilities:

- **Research Search**: query the web (articles/blogs/PDFs/links), view results, save them, and connect them to tasks/notes/conversations.
- **Daily Digest**: proactively recommend content based on user context (tasks/notes/conversations), with feedback loops and notifications.

This plan is designed to fit Taskflow’s existing architecture:

- **Embeddings** (1536 dims via `gemini-embedding-001`) already used for tasks/notes/messages vectors
- **Smart context** retrieval already exists (embedding → DB similarity → LLM decides related context)
- **AI chat** already supports a `WebSearchAgent` (via `@exalabs/ai-sdk` web search tool)
- **BullMQ + notifications** exist for async work + delivery

---

## 1) Goals / Non-goals

### Goals

- **Fast “find me sources”**: users can search and quickly get relevant links (with snippets + reasons).
- **Trustable output**: show sources clearly; avoid hallucinated citations.
- **Save + reuse**: users can save results, tag them, annotate, and attach to tasks/notes.
- **Digest that feels personal**: daily/weekly suggestions based on what the user is actively doing.
- **Low friction**: integrate into existing Global Search and AI Chat as first-class actions.

### Non-goals (v1)

- Full academic-grade citation formatting (APA/MLA) (can be v2)
- Full offline PDF OCR for scanned docs (can be v2)
- Crawling the entire web (stick to search + user-provided URLs + RSS feeds)

---

## 2) User experience (UX) flows

### Research Search flows

1. User opens **Research** panel or uses Global Search toggle “Web”.
2. User enters query: “best practices for bullmq workers”.
3. Results show:
   - title, domain, snippet, type (article/blog/pdf), published date (if available)
   - “Why this result?” (1 sentence)
   - actions: Open, Save, Add to Note, Attach to Task, Summarize
4. Saved items live in **Library** (searchable with embeddings + filters).

### Research from AI Chat

- Add quick actions:
  - “Research this”
  - “Find 5 sources”
  - “Summarize these links”
- Chat uses WebSearch tool + returns clickable sources + can save them.

### Daily Digest flows

1. At scheduled time, user gets in-app notification: “Daily Digest is ready”.
2. Digest page shows:
   - 3–7 recommended links
   - quick labels: “Related to: {Task/Note/Conversation}”
   - short summaries (2–4 bullets each)
   - actions: Save, Not interested, More like this, Less like this
3. User feedback improves next digests.

---

## 3) System architecture (how it fits Taskflow today)

### Existing primitives we should reuse

- **Embeddings**: already store vectors on tasks/notes/messages
- **Smart Context**: already retrieves relevant tasks/notes/messages for a prompt
- **WebSearchAgent**: already exists in AI tooling (web search with ~5 results)
- **BullMQ + notifications**: async processing + user delivery channel

### New module boundaries (recommended)

- `services/research/`
  - `search.ts|js` (web + curated sources)
  - `fetch.ts|js` (URL fetching + extraction)
  - `rank.ts|js` (scoring + dedupe)
  - `library.ts|js` (saved items CRUD)
- `services/digest/`
  - `context.ts|js` (pull user context from DB + embeddings)
  - `generate.ts|js` (topic extraction + query generation)
  - `deliver.ts|js` (notifications + persistence)
- `routes/v1/research.js`, `routes/v1/digest.js`
- `db/schema` additions for research + digests

---

## 4) Data model (DB tables)

### A) Research search history

**`research_searches`**

- `id`, `user_id`, `query`, `query_vector`, `filters` (jsonb), `created_at`
- `results` (jsonb) optional (store the top N results so user can revisit)

### B) Research library (“saved sources”)

**`research_items`**

- `id`, `user_id`
- `title`, `url`, `domain`, `type` (article/blog/pdf/link), `snippet`
- `content_text` (optional; extracted readable text, truncated)
- `metadata` (jsonb: author, published_at, etc.)
- `vector` (embedding of title+snippet+content_text)
- `created_at`, `updated_at`
- `source_quality` (optional: trust score, broken link flags)

### C) Linking saved research to Taskflow entities

**`research_links`**

- `id`, `user_id`
- `research_item_id`
- `entity_type` enum: task|note|conversation|project
- `entity_id`
- `created_at`

### D) Daily digests

**`digests`**

- `id`, `user_id`, `date`, `created_at`
- `context_snapshot` (jsonb: task ids, note ids, conversation ids used)
- `topics` (text[] or jsonb)
- `items` (jsonb: list of recommended results)
- `is_read` boolean

### E) Preferences + feedback

**`digest_preferences`**

- `user_id` unique
- enabled, frequency (daily|weekly), time_of_day, timezone
- preferred_types (article/blog/pdf), preferred_domains, blocked_domains
- max_items, exploration_ratio (how “new” vs “similar”)

**`research_feedback`**

- `user_id`, `research_item_id` (or url hash), `signal` (save|open|dismiss|not_interested|more_like_this), `created_at`
- Use to personalize ranking and digest generation

---

## 5) Research Search: core algorithm (v1 → v2)

### v1 ranking (simple, reliable)

Score = weighted sum of:

- semantic similarity(query_embedding, result_embedding)
- domain trust / allowlist bonus
- freshness bonus if published date is available
- dedupe penalty for similar URLs/domains
- user preferences (blocked domains, preferred types)

### v2 ranking (personalized)

- user preference embedding (built from saved items + positive feedback)
- multi-query expansion (LLM generates 3–6 refined queries)
- “explain ranking” per item (for transparency)

---

## 6) Content ingestion (URLs + PDFs)

### Supported sources (recommended order)

1. **Web search results** (existing WebSearch tool)
2. **User-pasted URL** (direct fetch + extract)
3. **RSS feeds** (opt-in per user or per topic)
4. **Academic sources** (optional): arXiv / Semantic Scholar style metadata feeds

### Extraction pipeline (async-friendly)

- fetch HTML/PDF
- extract readable text (boilerplate removal)
- compute embeddings
- store `research_items`
- optional: generate short summary bullets (LLM) and store in metadata

Notes:

- For PDFs: start with text-extraction-only (no OCR). OCR can be a later add-on.

---

## 7) Daily Digest generation (system design)

### Step-by-step digest job (v1)

1. **Gather context** (last 7–14 days):
   - top tasks by recency + priority + incomplete
   - recent notes
   - recent conversation summary/tags/intent
2. **Topic extraction**:
   - LLM returns 5–10 topics + keywords + “open loops” (unfinished goals/questions)
3. **Query generation**:
   - convert topics into 3–6 search queries (include user’s vocabulary)
4. **Fetch candidates**:
   - web search for each query (N results each)
5. **Rank + dedupe**:
   - compute embeddings and rank
   - avoid repeating domains excessively
   - avoid items already seen/saved
6. **Assemble digest**:
   - 3–7 items + 2–4 bullet summaries + “related to X” label
7. **Persist + notify**:
   - save digest row
   - send notification (existing notifications infra)

### Step-by-step digest job (v2)

- incorporate feedback signals
- “explore vs exploit” knob
- user-defined topics + blocked domains
- optionally send email in addition to in-app

---

## 8) API surface (proposed)

### Research

- `POST /api/v1/research/search` { query, filters }
- `GET /api/v1/research/searches` (history)
- `POST /api/v1/research/items` (save from url/result)
- `GET /api/v1/research/items` (library list + filters + semantic search)
- `GET /api/v1/research/items/:id`
- `POST /api/v1/research/items/:id/link` (attach to task/note/etc)
- `POST /api/v1/research/items/:id/feedback` (save/open/dismiss)

### Digest

- `GET /api/v1/digest/today`
- `GET /api/v1/digest/history`
- `POST /api/v1/digest/preferences`
- `POST /api/v1/digest/:id/read`
- `POST /api/v1/digest/:id/feedback` (per item)

---

## 9) Background jobs (BullMQ)

### Recommended queues

- `researchIngestQueue`: fetch+extract+embed for URLs/PDFs
- `digestQueue`: generate daily/weekly digest per user
- `researchCleanupQueue` (optional): link health checks, stale caches

### Scheduling

- Start simple: one cron daily that enqueues digest jobs for enabled users.
- Respect timezone + time-of-day preference.

---

## 10) UI deliverables (frontend)

### New pages/components

- **Research Search Page**
  - query bar + filters (type/date/domain)
  - results list + save actions
- **Research Library Page**
  - saved items with tags/notes + semantic search
  - “attach to task/note”
- **Digest Page**
  - today’s digest + history
  - feedback buttons

### Integrations

- Task detail: “Attach research”
- Note editor: “Insert sources”
- AI chat: “Research this” + “Save sources to library”

---

## 11) Observability, cost, and safety

### Observability

- log events: search_performed, result_opened, item_saved, digest_viewed
- track latency: web search time, ingest time, digest generation time
- track cost: LLM calls per digest, embeddings per ingest, search API usage

### Safety / trust

- always show sources (domain + url)
- add “content may be inaccurate” disclaimer
- avoid scraping content that is disallowed; prefer snippet + metadata unless user explicitly saves/ingests a URL
- rate limit per user; cache repeat queries

---

## 12) MVP roadmap (phased)

### Phase 0 (1–2 days): Spec + UX skeleton

- finalize endpoints + tables
- UI wireframes

### Phase 1 (MVP Research, 3–7 days)

- `POST /research/search` backed by existing web search capability
- results UI + “Save” (store url/title/snippet)
- library list + attach to tasks/notes

### Phase 2 (Ingestion + embeddings, 1–2 weeks)

- background ingest pipeline for saved URLs/PDFs
- vector search inside library (“search my sources”)
- dedupe + domain blocking

### Phase 3 (MVP Digest, 1–2 weeks)

- preferences
- daily digest job using user context + web search
- digest UI + notifications

### Phase 4 (Personalization + feedback, 2–4 weeks)

- feedback loop
- better ranking + diversity constraints
- topic-follow + “alerts”

---

## 13) Expansion ideas (high-leverage features that fit Taskflow)

### A) “Research Mode” inside AI chat

- a dedicated mode where the assistant:
  - always returns sources
  - can save sources automatically into library
  - can produce a “research brief” note

### B) Saved-source RAG (“Ask my library”)

- allow queries like: “What did I save about BullMQ retries?”
- retrieve top K `research_items` by vector similarity and answer with citations

### C) Task-linked briefs

- on a selected task, generate:
  - “What you need to know”
  - “Common pitfalls”
  - “Checklist”
  - with links

### D) Topic alerts / monitoring

- user defines topics (or selects from tasks)
- Taskflow monitors and notifies on new relevant items weekly/daily

### E) PDF upload + highlight/annotation

- upload PDFs into library
- highlight passages and link highlights to notes/tasks

### F) Knowledge graph / connections

- auto-suggest links:
  - “this source relates to these notes”
  - “these 3 tasks share a common topic”
- show graph view (optional)

### G) Team / shared library (later)

- shared research spaces for teams/projects
- permissioned sources + shared digests for a project

### H) “Digest as actions”

- digest items can be converted into:
  - tasks (“Read this”, “Implement this pattern”)
  - notes (“Summary note”)
  - project references

---

## 14) Open questions (decisions to make early)

- Which external search providers do we want beyond current web search tool (if any)?
- Do we ingest full text by default, or only when the user saves a link?
- Should digests be in-app only or also email?
- How strict should domain allow/block controls be?
- How many results per search and per digest (cost + UX balance)?
