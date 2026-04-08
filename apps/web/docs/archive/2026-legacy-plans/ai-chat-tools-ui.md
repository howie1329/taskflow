# AI Chat Tools UI

This doc explains how tool calls and the Chain of Thought UI are rendered in the web app, and how to extend them when adding new tools.

## Quick Map

- Chat page rendering: `apps/web/app/app/chat/[threadId]/page.tsx`
- Tool UI components: `apps/web/components/ai-elements/tool.tsx`
- Dedicated tool result cards: `apps/web/components/ai-elements/*-card.tsx`
- Chain of Thought UI: `apps/web/components/ai-elements/chain-of-thought.tsx`
- Provider badges + detection: `apps/web/components/ai-elements/provider-badge.tsx`
- Tool registration: `apps/web/lib/AITools/Tools.ts`

## How Tool Calls Flow to the UI

1. The AI SDK returns `UIMessage` objects with `parts`.
2. Tool calls appear as `ToolUIPart` or `DynamicToolUIPart` in those parts.
3. `getToolCalls()` in `apps/web/app/app/chat/[threadId]/page.tsx` extracts tool call data into a local `ToolCall` shape.
4. The UI renders:
   - Chain of Thought summary steps
   - Tool cards with details

## Chain of Thought Rendering

Location: `apps/web/components/ai-elements/chain-of-thought.tsx`

Key components:

- `EnhancedChainOfThoughtHeader`
  - Shows "Actions", step count, total duration (when provided), and provider badges.
- `ChainOfThoughtStep`
  - Shows step label, description, status, optional timing and provider badge.

Usage location:
`apps/web/app/app/chat/[threadId]/page.tsx`

The chat page builds:

- `toolCalls` list
- `displayName` for each tool call
- `stateInfo` for status
- `summary` from inputs

Then renders:

- `EnhancedChainOfThoughtHeader` for the summary header
- `ChainOfThoughtStep` for each call

## Tool Card Rendering

Location: `apps/web/components/ai-elements/tool.tsx`

Key components:

- `EnhancedToolHeader`
  - Shows tool name, provider badge, status badge, and timing when available.
- `ToolSummaryBar`
  - One-line summary of input/output results.
- `ToolMetaPanel`
  - Structured metadata: provider, tool name, status, input/output size.
- `ToolContent`
  - Collapsible area for the detail content.

The chat page uses:

- `getToolSummary()` to build a short summary.
- `getToolMetaItems()` to build the metadata panel.
- `renderToolContent()` with a `switch(toolKey)` mapping for custom renderers.

### Tool key normalization

- `ToolCall.toolKey` is normalized from raw tool names with `replace(/^tool-/, "")`.
- Provider detection, metadata labels, and custom renderer dispatch all use `toolKey`.
- This keeps behavior consistent between `tool-*` and `dynamic-tool` message parts.

### Current custom render map

- `tavilyWebSearch` → `TavilyWebSearchCard`
- `exaWebSearch` → `ExaWebSearchCard`
- `exaAnswer` → `ExaAnswerCard`
- `firecrawlSearch` → `FirecrawlSearchCard`
- `firecrawlScrape` → `FirecrawlScrapeCard`
- `parallelWebSearch` → `ParallelWebSearchCard`
- `valyuWebSearch` → `ValyuWebSearchCard`
- `valyuFinanceSearch` → `ValyuFinanceSearchCard`
- Taskflow tools (`listTasks`, `createTask`, etc.) → `TaskflowToolResultCard`

## Provider Badges

Location: `apps/web/components/ai-elements/provider-badge.tsx`

- `detectProvider(toolName)` maps normalized tool keys to provider types.
- `providerConfig` defines label, icon, and colors for each provider.
- `ProviderBadge` renders the badge.
- `TimingBadge` renders duration in milliseconds/seconds with color coding.

Current provider types:

- `taskflow`
- `tavily`
- `exa`
- `parallel`
- `firecrawl`
- `valyu`
- `supermemory`
- `github`
- `unknown`

When adding a new provider or tool:

1. Add the provider to `providerConfig` if it is new.
2. Update `detectProvider()` to match the new tool name.
3. Optionally, adjust badge colors if needed.

## Adding a New Tool

1. Register the tool in `apps/web/lib/AITools/Tools.ts`.
2. If the tool is workspace-based, add it to `apps/web/lib/AITools/Taskflow.ts`.
3. Ensure the tool name is stable and descriptive. The UI derives labels from tool name.
4. For custom UI:
   - Add a new special-case block in `renderToolContent()` in `apps/web/app/app/chat/[threadId]/page.tsx`.
   - Add a matching summary in `getToolSummary()` if needed.
5. For provider attribution:
   - Update `detectProvider()` and `providerConfig`.

## Special Rendering

Most active tools now have dedicated cards. Unknown tools still use the generic summary/JSON fallback.

If you add a new tool with structured output:

- Add a card in `apps/web/components/ai-elements/`
- Map it in `renderToolContent()` by `toolKey`
- Add a summary rule in `getToolSummary()`
- Keep generic fallback for shape drift or unknown tools

## Tool Summary + Metadata Logic

- `getToolSummary()` tries:
  1. Special case web search
  2. Output summary
  3. Input summary
  4. Default to null

- `getToolMetaItems()` shows:
  - Provider name (via `providerConfig`)
  - Tool name
  - Status
  - Input/Output size (best-effort)

If you add new metadata fields later (latency, credits, cache), extend this function.

## Timing Support

UI is timing-ready (`TimingBadge`), but tool durations are not wired yet. Recommended approach:

1. In each tool's `execute`, wrap work with `const start = performance.now()`.
2. On completion, attach `_meta: { durationMs }` to tool output.
3. Update `renderToolContent()` to read and pass duration into `EnhancedToolHeader` and `ChainOfThoughtStep`.

## Feature Toggles

`useViewer().preferences` controls visibility:

- `aiChatShowActions` toggles the Chain of Thought block.
- `aiChatShowToolDetails` toggles detailed Tool cards.
- `aiChatShowReasoning` toggles reasoning view.

## Where to Edit

- Layout changes: `apps/web/components/ai-elements/tool.tsx`
- Summary/metadata logic: `apps/web/app/app/chat/[threadId]/page.tsx`
- Provider mapping: `apps/web/components/ai-elements/provider-badge.tsx`
- Tool registration: `apps/web/lib/AITools/Tools.ts`

## Best Practices

- Keep tool names stable; UI labels are derived from them.
- Keep summaries short and readable.
- Prefer special-case rendering only for highly structured outputs.
- Use `ToolMetaPanel` for extra info instead of bloating headers.
