# AI Chat

Routes:

- `/app/chat`
- `/app/chat/[threadId]`

## Purpose

Provide workspace-aware AI assistance with visible actions, tool execution, and thread history inside the app.

## Current Behavior

- New chat landing with centered composer
- Thread view with conversation log and bottom composer
- Thread rail with search, pin, rename, and delete
- Model, mode, and optional project selection in composer controls
- Optional tool-lock behavior based on selected mode
- User preferences can control reasoning, action summaries, and tool detail visibility

## Data and Flow

- Threads and messages are loaded from Convex chat APIs
- Chat generation is sent through `/api/chat`
- Client chat state is managed by the route-level chat provider

## Tool and Reasoning UI

Assistant responses can render:

- action summaries for tool activity
- expandable tool detail cards
- advanced/raw detail only when the UI explicitly reveals it

The default interaction should favor readable conversation first, with deeper execution details available on demand.

## Notes

- Tool execution states should remain structured and traceable.
- Unknown tool payloads should still degrade to a compact readable summary.
- Older AI UI planning docs have been archived rather than kept as canonical references.

See:

- [`../architecture/ai.md`](../architecture/ai.md)
