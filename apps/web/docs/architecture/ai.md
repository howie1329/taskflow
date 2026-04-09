# AI Architecture

This document describes the current AI system in `apps/web`, centered on `/app/chat`.

## Runtime Model

- Chat UI lives at:
  - `/app/chat`
  - `/app/chat/[threadId]`
- Thread metadata and message history are stored in Convex.
- Generation is sent through `/api/chat`.
- Client state is coordinated by the chat provider and route-level chat shell.

## Core Pieces

- `app/app/chat/components/chat-provider.tsx`
  - owns active thread, selected model, mode, project scope, and send behavior
- `app/app/chat/[threadId]/components/thread-message-list.tsx`
  - renders messages, reasoning, and tool output sections
- `app/app/chat/[threadId]/components/tool-panels.tsx`
  - renders compact action summaries and expandable detail cards
- `components/ai-elements/*`
  - shared UI primitives for messages, composer, reasoning, and tool rendering
- `lib/AITools/*`
  - tool registry, provider-specific tool modules, mode mappings, and prompt logic

## Tool Execution Model

The current app treats tool activity as a first-class UI concern.

- Assistant messages can include action summaries and expanded tool detail cards.
- Tool output should preserve enough structure to show:
  - current state
  - human-readable status
  - key inputs
  - useful outputs or errors
- The stable status model is:
  - `pending`
  - `loading`
  - `complete`
  - `error`

This keeps long-running or multi-step AI actions traceable without forcing raw payloads into the default reading flow.

## Tool Organization

Tools are organized under `lib/AITools` by provider and exported through shared index files.

- provider folders own provider-specific implementations
- `index.ts` aggregates tool exports
- mode mapping selects which tool keys are available in each chat mode
- custom tools can compose provider tools when Taskflow needs a single higher-level action

## Context and History Guidance

Current architecture should keep context handling explicit and conservative.

- Prefer model-aware token budgets over fixed message-count slicing.
- Preserve important tool-call context instead of pruning it blindly.
- Keep recent conversation fidelity while summarizing older history when needed.
- Treat context-window management as a system concern that should be visible in docs and code, not hidden behind ad hoc limits.

These are guiding constraints from legacy chat work, not a promise that every optimization is already implemented in `apps/web`.

## Related Docs

- [`../features/ai-chat.md`](../features/ai-chat.md)
- [`./overview.md`](./overview.md)
