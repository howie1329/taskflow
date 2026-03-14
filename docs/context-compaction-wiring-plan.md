# Wire @taskflow/context-compaction to apps/web — Plan

## Objective

1. Add the necessary chat-content utilities to `@taskflow/context-compaction` so the package is self-contained for the chat flow.
2. Replace `apps/web/lib/chat/context-compaction` with the new package.
3. Replace `@taskflow/chat-content` usage in chat routes with `@taskflow/context-compaction`.
4. Remove the old compaction code and the `@taskflow/chat-content` dependency from apps/web.

---

## Files to Change

| File | Action |
|------|--------|
| `packages/Taskflow-Context-Compaction/src/` | Add validation, serialization, text helpers from chat-content |
| `packages/Taskflow-Context-Compaction/src/index.ts` | Export new utilities |
| `apps/web/package.json` | Add `@taskflow/context-compaction`; remove `@taskflow/chat-content` |
| `apps/web/app/api/chat/route.ts` | Switch all imports to `@taskflow/context-compaction` |
| `apps/web/app/api/chat/compact/route.ts` | Switch all imports to `@taskflow/context-compaction` |
| `apps/web/lib/chat/context-compaction/` | **Delete** entire directory |
| `apps/web/tsconfig.json` | Replace `@taskflow/chat-content` path with `@taskflow/context-compaction` |

---

## Phase 0: Add Chat-Content Utilities to @taskflow/context-compaction

Add the code from `@taskflow/chat-content` that apps/web chat routes use. This lets apps/web drop chat-content entirely.

### 0.1 Create `src/utils/serialization.ts`

Copy from `packages/Taskflow-Chat-Content/src/serialization.ts`:

- [ ] `ChatContentError` class
- [ ] `makeJsonSerializable(value: unknown): JsonValue`
- [ ] `assertJsonSerializable(value: unknown)` (optional; export if needed)

### 0.2 Create `src/utils/validation.ts`

Copy and adapt from `packages/Taskflow-Chat-Content/src/validation.ts`:

- [ ] `uiPartSchema`, `uiMessageSchema`, `uiMessagesSchema` (zod schemas)
- [ ] `storedThreadMessageSchema`
- [ ] `safeParseUIMessages(input: unknown)` → `{ success, data } | { success, error }`
- [ ] `normalizeUIMessages(messages: UIMessage[])` — uses `makeJsonSerializable` from `./serialization.js`
- [ ] `fromStoredThreadMessage(storedMessage: StoredThreadMessage)` → `UIMessage`
- [ ] `toStoredThreadMessage(message, meta)` (optional; export if used elsewhere)

Import `makeJsonSerializable` from `./serialization.js`. Add `StoredThreadMessage` type (see 0.4).

### 0.3 Extend `src/utils/text.ts`

Add from `packages/Taskflow-Chat-Content/src/text.ts`:

- [ ] `getInitialUserText(messages: UIMessage[]): string` — first user message text
- [ ] `getLatestUserMessage(messages: UIMessage[], preferredMessageId?): UIMessage | null`

Both use `getTextFromUIMessage` (already present).

### 0.4 Add types

- [ ] Add `StoredThreadMessage` type to `src/utils/validation.ts` or new `src/utils/chat-types.ts`:
  ```ts
  export type StoredThreadMessage = {
    messageId: string
    role: "user" | "assistant" | "system"
    model: string
    content: unknown
    createdAt?: number
    updatedAt?: number
  }
  ```

### 0.5 Update `src/utils/index.ts`

- [ ] Export from `serialization.ts`: `makeJsonSerializable`, `ChatContentError`, `assertJsonSerializable`
- [ ] Export from `validation.ts`: `safeParseUIMessages`, `normalizeUIMessages`, `fromStoredThreadMessage`, `StoredThreadMessage`, schemas
- [ ] Export from `text.ts`: `getInitialUserText`, `getLatestUserMessage`

### 0.6 Update `src/index.ts`

- [ ] Export: `safeParseUIMessages`, `normalizeUIMessages`, `fromStoredThreadMessage`, `getInitialUserText`, `getLatestUserMessage`
- [ ] Export: `makeJsonSerializable`, `ChatContentError`, `StoredThreadMessage`, `uiMessageSchema`, `uiPartSchema`, `storedThreadMessageSchema` (for consumers who need them)

### 0.7 Build and verify package

- [ ] `npm run build --workspace=@taskflow/context-compaction`
- [ ] Confirm no type errors

---

## Phase 1: Add Dependency and Remove chat-content

### 1.1 Update apps/web package.json

- [ ] Add `"@taskflow/context-compaction": "1.0.0"` to `dependencies`
- [ ] Remove `"@taskflow/chat-content": "1.0.0"` from `dependencies`
- [ ] Run `npm install` from workspace root

### 1.2 Update apps/web tsconfig.json

- [ ] Replace the `@taskflow/chat-content` path with `@taskflow/context-compaction`:
  ```json
  "@taskflow/context-compaction": ["../../packages/Taskflow-Context-Compaction/dist/index.js"]
  ```
- [ ] Remove the `@taskflow/chat-content` path entry

---

## Phase 2: Update API Routes

### 2.1 `app/api/chat/route.ts`

**Imports to change:**

Replace both the context-compaction and chat-content imports with a single import from `@taskflow/context-compaction`:

```diff
- import {
-   safeParseUIMessages,
-   normalizeUIMessages,
-   getInitialUserText,
-   getLatestUserMessage,
-   fromStoredThreadMessage,
- } from "@taskflow/chat-content";
- import {
-   planCompaction,
-   selectContextMessages,
-   formatMessagesForSummarizer,
-   generateThreadSummary,
-   generateStructuredThreadState,
-   assemblePromptContext,
-   DEFAULT_COMPACTION_CONFIG,
-   isPastCompactionCooldown,
- } from "@/lib/chat/context-compaction";
+ import {
+   safeParseUIMessages,
+   normalizeUIMessages,
+   getInitialUserText,
+   getLatestUserMessage,
+   fromStoredThreadMessage,
+   planCompaction,
+   selectContextMessages,
+   formatMessagesForSummarizer,
+   generateThreadSummary,
+   generateStructuredThreadState,
+   assemblePromptContext,
+   DEFAULT_COMPACTION_CONFIG,
+   isPastCompactionCooldown,
+ } from "@taskflow/context-compaction";
```

**Generation calls to change:**

The new package expects `model: LanguageModel` instead of `googleModel`. The route already has `googleModel` from `createGoogleGenerativeAI({ apiKey: ... })`. Pass the model instance:

```diff
       const [updatedSummary, updatedState] = await Promise.all([
         generateThreadSummary({
-          googleModel,
+          model: googleModel("gemini-3.1-flash-lite-preview"),
           previousSummary: summaryTextForContext,
           transcript,
           maxSummaryChars: COMPACTION_CONFIG.maxSummaryChars,
         }),
         generateStructuredThreadState({
-          googleModel,
+          model: googleModel("gemini-3.1-flash-lite-preview"),
           previousState: threadStateForContext ?? null,
           transcript,
         }),
       ])
```

- [ ] Update import
- [ ] Update both `generateThreadSummary` and `generateStructuredThreadState` calls

### 2.2 `app/api/chat/compact/route.ts`

**Imports to change:**

Replace both chat-content and context-compaction imports with a single import:

```diff
- import { fromStoredThreadMessage } from "@taskflow/chat-content"
- import {
-   planCompaction,
-   formatMessagesForSummarizer,
-   generateThreadSummary,
-   generateStructuredThreadState,
-   DEFAULT_COMPACTION_CONFIG,
- } from "@/lib/chat/context-compaction"
+ import {
+   fromStoredThreadMessage,
+   planCompaction,
+   formatMessagesForSummarizer,
+   generateThreadSummary,
+   generateStructuredThreadState,
+   DEFAULT_COMPACTION_CONFIG,
+ } from "@taskflow/context-compaction"
```

**Generation calls to change:**

```diff
     const [updatedSummary, updatedState] = await Promise.all([
       generateThreadSummary({
-        googleModel,
+        model: googleModel("gemini-3.1-flash-lite-preview"),
         previousSummary: existingSummary?.summaryText ?? "",
         transcript,
         maxSummaryChars: DEFAULT_COMPACTION_CONFIG.maxSummaryChars,
       }),
       generateStructuredThreadState({
-        googleModel,
+        model: googleModel("gemini-3.1-flash-lite-preview"),
         previousState: existingSummary?.threadState ?? null,
         transcript,
       }),
     ])
```

- [ ] Update import
- [ ] Update both generation calls

---

## Phase 3: Remove Old Code

### 3.1 Delete lib/chat/context-compaction

- [ ] Delete `apps/web/lib/chat/context-compaction/types.ts`
- [ ] Delete `apps/web/lib/chat/context-compaction/config.ts`
- [ ] Delete `apps/web/lib/chat/context-compaction/planning.ts`
- [ ] Delete `apps/web/lib/chat/context-compaction/assembly.ts`
- [ ] Delete `apps/web/lib/chat/context-compaction/generation.ts`
- [ ] Delete `apps/web/lib/chat/context-compaction/index.ts`
- [ ] Remove the now-empty `context-compaction` directory

---

## Phase 4: Verification

### 4.1 Build and lint

- [ ] `npm run build --workspace=@taskflow/context-compaction` (ensure package is built)
- [ ] `npm run build --workspace=@taskflow/web` (or `npm run build` from root)
- [ ] `npm run lint` (fix any new issues)

### 4.2 Smoke test

- [ ] Start dev server: `npm run dev:web`
- [ ] Open a chat thread, send messages until compaction triggers (or use "Compact chat")
- [ ] Confirm no runtime errors; compaction behaves as before

---

## Checklist Summary

| Phase | Tasks |
|-------|-------|
| 0. Package | Add chat-content utilities to @taskflow/context-compaction (validation, serialization, text helpers) |
| 1. Dependency | Add context-compaction, remove chat-content from apps/web; update tsconfig |
| 2. Routes | Update imports and generation calls in route.ts and compact/route.ts |
| 3. Cleanup | Delete apps/web/lib/chat/context-compaction/ |
| 4. Verify | Build, lint, smoke test |
| 5. chat-content | Confirm no other usages; deprecate or remove chat-content |

---

## Phase 5: Remove chat-content Dependency

- [ ] Confirm no other files in apps/web import from `@taskflow/chat-content` (grep before removing)
- [ ] If any other files use chat-content, either migrate them to context-compaction or leave chat-content as a dependency for those files only. The chat routes (route.ts, compact/route.ts) are the primary consumers; others may exist.
- [ ] After wiring is complete, `@taskflow/chat-content` can be deprecated or removed from the monorepo.

---

## Out of Scope (Unchanged)

- **Convex schema, mutations** — No changes; `setThreadSummary` and thread shape stay the same.
- **UI components** — ThreadContextFooterBadge, thread-header Compact button, etc. — no changes.

---

## Pre-Wiring Check: Other chat-content Usages

Before removing `@taskflow/chat-content` from apps/web, run:

```bash
grep -r "@taskflow/chat-content\|from.*chat-content" apps/web --include="*.ts" --include="*.tsx"
```

If results show only `route.ts` and `compact/route.ts`, safe to remove. If other files use it, add a migration step for those or keep chat-content until they are updated.

---

## Optional: Update Docs

- [ ] `apps/web/docs/context-compaction-plan.md` — Add note that implementation now lives in `@taskflow/context-compaction`, or archive/remove if obsolete.
