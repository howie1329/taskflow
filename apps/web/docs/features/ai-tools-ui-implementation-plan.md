# AI Tools UI + Provider Alignment (Implementation Plan)

Goal: for every AI tool that can run in `apps/web/app/api/chat/route.ts`, render a dedicated result component in the chat UI and ensure provider attribution (badges + labels) matches the actual tool providers.

## Current Inventory (Source Of Truth)

Tool registry (aggregated): `apps/web/lib/AITools/index.ts`

- Taskflow: `listTasks`, `getTask`, `createTask`, `updateTask`, `deleteTask`, `listProjects`, `getProject`, `createProject`, `updateProject`, `deleteProject`, `listInboxItems`, `getInboxItem`, `createInboxItem`, `updateInboxItem`, `deleteInboxItem`
- Tavily: `tavilyWebSearch`
- Exa: `exaWebSearch`, `exaAnswer`
- Firecrawl: `firecrawlSearch`, `firecrawlScrape`
- Parallel: `parallelWebSearch`
- Valyu: `valyuWebSearch`, `valyuFinanceSearch`
- Supermemory: injected at runtime in `apps/web/app/api/chat/route.ts` via `supermemoryTools(...)`

Mode activation: `apps/web/lib/AITools/ModeMapping.ts` + `apps/web/lib/AITools/ModePrompts.ts`

Tool UI rendering entrypoint: `apps/web/app/app/chat/[threadId]/page.tsx` (`renderToolContent()`)

Provider UI: `apps/web/components/ai-elements/provider-badge.tsx`

## Problem Statement

- Only Tavily currently has a dedicated result component in `renderToolContent()`.
- All other tools fall back to a generic summary string/JSON view.
- Provider attribution is heuristic-based and currently misclassifies some tools (notably `valyuWebSearch` as Tavily due to the `websearch` substring check).

## Implementation Phases

### Phase 1: Normalize Tool Name Handling In UI

Files:

- `apps/web/app/app/chat/[threadId]/page.tsx`

Tasks:

- Introduce a normalized tool key: `toolKey = toolCall.toolName.replace(/^tool-/, "")`.
- Use `toolKey` for:
  - selecting custom renderers
  - provider detection
  - metadata display (`ToolMetaPanel`), so it’s consistent whether the tool part is `tool-*` or `dynamic-tool`

Acceptance:

- Tool cards show stable tool names in metadata.
- Switching between tool part styles does not break rendering.

### Phase 2: Align Provider Detection With Tool Providers

Files:

- `apps/web/components/ai-elements/provider-badge.tsx`
- (call sites) `apps/web/app/app/chat/[threadId]/page.tsx` (ensure it passes normalized name)

Tasks:

- Add provider types + config entries for:
  - `valyu`
  - `supermemory`
- Fix `detectProvider()` ordering so `valyu*` is detected before the generic `websearch` heuristic.
- Audit/remove legacy heuristics if they don’t correspond to current tool keys (e.g. `massive`).

Acceptance:

- `valyuWebSearch` and `valyuFinanceSearch` show `Valyu` provider.
- Supermemory tool calls show `Supermemory` provider.

### Phase 3: Create Dedicated Result Components Per Tool

Folder:

- `apps/web/components/ai-elements/`

Add components:

- `exa-web-search-card.tsx`
- `exa-answer-card.tsx`
- `firecrawl-search-card.tsx`
- `firecrawl-scrape-card.tsx`
- `parallel-web-search-card.tsx`
- `valyu-web-search-card.tsx`
- `valyu-finance-search-card.tsx`

Guidelines:

- Keep rendering resilient: add small type guards and show a helpful fallback state if output shape changes.
- Prefer a compact “summary + list/grid + metadata footer” layout, similar to `apps/web/components/ai-elements/tavily-web-search-card.tsx`.
- Keep the existing generic fallback for unknown tools.

Acceptance:

- Each listed tool renders a custom component when its output is available.
- No runtime crashes for missing/partial outputs.

### Phase 4: Move Output Schemas/Types To Client-Safe Modules

Reason:

- Some tool files import server-only SDKs; client components must not import those modules.

Files (add):

- `apps/web/lib/AITools/Firecrawl/types.ts`
- `apps/web/lib/AITools/ParallelAi/types.ts`
- (optional) `apps/web/lib/AITools/Valyu/zod.ts` or augment `apps/web/lib/AITools/Valyu/types.ts` with client-safe zod schemas

Files (update):

- `apps/web/lib/AITools/Firecrawl/search.ts`
- `apps/web/lib/AITools/Firecrawl/scrape.ts`
- `apps/web/lib/AITools/ParallelAi/search.ts`

Acceptance:

- Tool execute modules import types/schemas from the new `types.ts` modules.
- UI components import only the client-safe `types.ts` modules.

### Phase 5: Wire Tool Components Into `renderToolContent()`

Files:

- `apps/web/app/app/chat/[threadId]/page.tsx`

Tasks:

- Replace the single Tavily special-case with a `switch (toolKey)` mapping tool keys to their cards.
- Keep the current Tavily card behavior.
- Preserve generic fallback (summary/JSON) for unknown tools.

Acceptance:

- Custom cards are selected by `toolKey` for all tools.
- Unknown tools still render a usable output.

### Phase 6: Harden Mode Handling (Prevent Server Crashes)

Files:

- `apps/web/app/api/chat/route.ts`

Tasks:

- Guard `ModeMapping[mode]` access with a fallback to `Basic` when mode is missing/invalid.

Acceptance:

- Invalid/unknown `mode` values do not throw.

## Definition Of Done

- Every active tool in `apps/web/lib/AITools/index.ts` has a custom result component (or an explicit decision to keep generic rendering).
- Provider badges match the tool providers (no Valyu-as-Tavily mislabeling).
- No client bundle errors from importing server-only SDK modules.
- Lint passes (`npm run lint` at repo level).

## Suggested Smoke Tests

- In chat, trigger each mode (`Basic`, `Advanced`, `Finance`, `Research`, `Social`) and confirm the tool cards render.
- Trigger each tool at least once and verify:
  - Provider badge is correct
  - Tool details panel shows the custom UI
  - Generic fallback works for unknown outputs
