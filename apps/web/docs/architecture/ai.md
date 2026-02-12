# AI Architecture

This document describes AI behavior in `apps/web`, centered on `/app/chat`.

## Runtime Model

- Chat UI is rendered in App Router routes:
  - `/app/chat`
  - `/app/chat/[threadId]`
- Conversation state is managed via chat provider context.
- Message history and thread metadata are fetched from Convex.
- Assistant generation is sent through `/api/chat` using selected model/mode/tool lock.

## Core Pieces

- `app/app/chat/components/chat-provider.tsx`
  - owns active thread ID, model/mode/project selection, and send behavior
- `app/app/chat/[threadId]/components/thread-message-list.tsx`
  - renders messages, reasoning, and tool panel stubs
- `app/app/chat/[threadId]/components/tool-panels.tsx`
  - renders action summaries and expandable tool details
- `components/ai-elements/*`
  - shared primitives for conversation, prompt input, tool cards, chain-of-thought

## Tool Call Rendering

- Tool parts are extracted from assistant message parts.
- UI renders:
  - compact actions summary (default collapsed)
  - optional expanded tool detail cards
- Provider badges/status metadata are mapped from tool keys.

See:

- `features/ai-chat-tools-ui.md`
- `features/ai-tools-ui-implementation-plan.md`

## Modes and Tool Locking

- Mode prompts and routing logic live in `lib/AITools/ModePrompts.ts`.
- Tool lock command behavior is constrained by selected mode/tool availability.
- Viewer preferences can control reasoning/actions/tool detail visibility.

## Known Constraints

- UI rendering is richer than some backend validation conventions today; keep output handling defensive.
- Keep fallback summaries for unknown tool payload shapes.
