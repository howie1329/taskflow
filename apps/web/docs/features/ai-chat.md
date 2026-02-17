# AI Chat

Routes:

- `/app/chat`
- `/app/chat/[threadId]`

## Purpose

Provide workspace-aware AI assistance with optional tool/action execution and traceability.

## Current Behavior

- New chat landing with centered composer
- Thread view with conversation log and bottom composer
- Thread rail with search, pin, rename, delete
- Model/mode/project selection in composer controls
- Optional tool lock command behavior based on selected mode
- Reasoning/actions/tool details controlled by user preferences

## Data and Flow

- Threads/messages read from Convex (`api.chat.*`)
- Chat requests sent through `/api/chat`
- Client chat state managed by `components/chat-provider.tsx`

## Tool/Reasoning UI

- Assistant messages can render:
  - action summary
  - expanded tool cards
  - raw payload (advanced disclosure)

See:

- `features/ai-chat-tools-ui.md`
- `architecture/ai.md`
