# @taskflow/context-compaction — Package Creation Plan

## Objective

Extract chat context compaction and summarization logic from `apps/web` into a self-contained package `@taskflow/context-compaction` with **no dependency on `@taskflow/chat-content`**. The chat-content package is being deprecated; this package embeds the minimal utilities it needs.

---

## Embedded Utilities (from chat-content)

The compaction logic currently uses two functions from `@taskflow/chat-content`. These will be recreated inside the new package:

| Utility | Purpose |
|---------|---------|
| `getTextFromUIMessage(message, options?)` | Extract text from Vercel AI SDK `UIMessage` parts (text, optional tool-result) |
| `estimateTokensFromUIMessages(messages, options?)` | Estimate token count via `gpt-tokenizer` |

**Options type:** `{ includeToolText?: boolean; maxCharsPerMessage?: number }`

**Implementation notes:**
- Match behavior from `packages/Taskflow-Chat-Content/src/text.ts` and `tokens.ts`
- Use `gpt-tokenizer` for token estimation (add as dependency)
- Keep scope minimal: only what planning/formatting needs

---

## Phase 1: Package Scaffold

### 1.1 Create package directory and config

- [ ] Create `packages/Taskflow-Context-Compaction/`
- [ ] Add `package.json`:
  - `name`: `@taskflow/context-compaction`
  - `version`: `1.0.0`
  - `type`: `"module"`
  - `exports`: `"."` → `./dist/index.js` + types
  - `files`: `["dist", "README.md", "package.json"]`
  - `dependencies`: `ai`, `zod`, `gpt-tokenizer`
  - `peerDependencies`: `ai` (^6.x)
  - `devDependencies`: `typescript`
  - **No** `@taskflow/chat-content` dependency
- [ ] Add `tsconfig.json` (match `Taskflow-Chat-Content` / `Taskflow-Rag` structure)
- [ ] Add `README.md` with package description and installation

### 1.2 Verify workspace

- [ ] Confirm `packages/*` is in root `package.json` workspaces
- [ ] Run `npm install` from root to link workspace

---

## Phase 2: Embedded Utilities (Replace chat-content)

### 2.1 Create `src/utils/text.ts`

- [ ] Add `TextExtractionOptions` type: `{ includeToolText?: boolean; maxCharsPerMessage?: number }`
- [ ] Add `getTextFromUIMessage(message: UIMessage, options?: TextExtractionOptions): string`
  - Iterate `message.parts`, extract text from `type: "text"` and optionally `type: "tool-result"`
  - Use `maxCharsPerMessage` (default 8000) to clamp output
  - Replicate logic from `Taskflow-Chat-Content/src/text.ts` (lines 1–55)

### 2.2 Create `src/utils/tokens.ts`

- [ ] Add `estimateTokensFromText(text: string): number` — `encode(text).length` via `gpt-tokenizer`
- [ ] Add `estimateTokensFromUIMessages(messages, options?): number` — build transcript via `getTextFromUIMessage`, then `estimateTokensFromText`
  - Replicate logic from `Taskflow-Chat-Content/src/tokens.ts`

### 2.3 Create `src/utils/index.ts`

- [ ] Re-export text and token utilities (internal use; optionally export for consumers)

---

## Phase 3: Move Pure Compaction Logic (No LLM)

### 3.1 Copy and adapt source files

| Source (`apps/web/lib/chat/context-compaction/`) | Target (`packages/Taskflow-Context-Compaction/src/`) |
|-------------------------------------------------|------------------------------------------------------|
| `types.ts` | `types.ts` — copy as-is |
| `config.ts` | `config.ts` — copy as-is |
| `planning.ts` | `planning.ts` — import from `./utils/...` instead of `@taskflow/chat-content` |
| `assembly.ts` | `assembly.ts` — copy as-is (no external deps) |

### 3.2 Update planning.ts imports

- [ ] Replace `import { estimateTokensFromUIMessages, getTextFromUIMessage } from "@taskflow/chat-content"` with `import { ... } from "./utils/text.js"` and `"./utils/tokens.js"`
- [ ] Ensure no `@/` or app-specific paths remain

### 3.3 Create main index.ts

- [ ] Export: `types`, `config`, `planning`, `assembly`
- [ ] Export: `getTextFromUIMessage`, `estimateTokensFromUIMessages`, `estimateTokensFromText`, `TextExtractionOptions` (for consumers who need them)
- [ ] Do not export `generation` yet (Phase 4)

---

## Phase 4: Generation with Model Injection

### 4.1 Refactor generation.ts

- [ ] Change `generateThreadSummary` signature to accept `model: LanguageModel` instead of `googleModel: ReturnType<typeof createGoogleGenerativeAI>`
- [ ] Change `generateStructuredThreadState` same way
- [ ] Use `generateText({ model, ... })` — model comes from caller
- [ ] Remove `createGoogleGenerativeAI` import from package
- [ ] Keep `ai` and `zod` as dependencies (for `generateText`, `Output`, schema)

### 4.2 Export generation from index

- [ ] Export `generateThreadSummary`, `generateStructuredThreadState`
- [ ] Document in README that caller must pass a compatible model (e.g. Gemini, OpenAI)

---

## Phase 5: Wire apps/web to Package

### 5.1 Add dependency

- [ ] In `apps/web/package.json`, add `"@taskflow/context-compaction": "1.0.0"` (or workspace reference)
- [ ] Run `npm install`

### 5.2 Replace imports in apps/web

- [ ] `app/api/chat/route.ts`: replace `@/lib/chat/context-compaction` with `@taskflow/context-compaction`
- [ ] `app/api/chat/compact/route.ts`: same
- [ ] Update generation calls to pass `googleModel("gemini-3.1-flash-lite-preview")` (or equivalent) as `model`
- [ ] **Note:** `apps/web` may still use `@taskflow/chat-content` elsewhere (e.g. `fromStoredThreadMessage`, `safeParseUIMessages`). Those remain until chat-content is fully deprecated. Only context-compaction imports change.

### 5.3 Remove old compaction module

- [ ] Delete `apps/web/lib/chat/context-compaction/`
- [ ] Fix any remaining `@/lib/chat/context-compaction` references (e.g. tsconfig paths)

---

## Phase 6: Documentation and Validation

### 6.1 Package README

- [ ] Installation: `npm install @taskflow/context-compaction`
- [ ] API overview: types, config, planning, assembly, generation, utils
- [ ] Usage example: minimal flow (plan → format → generate → assemble)
- [ ] Note: generation requires a model from the app (e.g. `createGoogleGenerativeAI`, `createOpenAI`)
- [ ] Note: package is self-contained; no dependency on `@taskflow/chat-content`

### 6.2 Build and lint

- [ ] `npm run build --workspace=@taskflow/context-compaction`
- [ ] `npm run lint` from root
- [ ] Verify `apps/web` still builds and chat compaction works

---

## Checklist Summary

| Phase | Tasks |
|-------|-------|
| 1. Scaffold | package.json (no chat-content), tsconfig, README, workspace link |
| 2. Embedded utils | text.ts, tokens.ts — recreate getTextFromUIMessage, estimateTokensFromUIMessages |
| 3. Pure logic | types, config, planning, assembly → src/; planning uses local utils |
| 4. Generation | model injection, export from index |
| 5. Integration | apps/web uses package, remove old lib |
| 6. Docs & validation | README, build, lint, smoke test |

---

## Dependencies Summary

| Package | Role |
|---------|------|
| `ai` | `UIMessage`, `generateText`, `Output` |
| `zod` | `ThreadState` schema for structured output |
| `gpt-tokenizer` | Token estimation for `estimateTokensFromUIMessages` |

**Removed:** `@taskflow/chat-content` — functionality embedded in `src/utils/`

---

## Deprecation Note

`@taskflow/chat-content` is being deprecated. This package does not depend on it. Apps migrating away from chat-content can use `getTextFromUIMessage` and `estimateTokensFromUIMessages` from this package for compaction-related needs. Other chat-content utilities (validation, serialization, `fromStoredThreadMessage`, etc.) must be migrated separately when deprecating chat-content.

---

## Out of Scope (Stay in apps/web)

- Convex schema, mutations, queries
- API routes (`/api/chat`, `/api/chat/compact`)
- UI (Compact button, badges, inspector)
- Model provider setup (`createGoogleGenerativeAI`, env vars)
