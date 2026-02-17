Chat UI Snapshot (Current)

**Routes Implemented**

- `/app/chat` for new chat landing
- `/app/chat/[threadId]` for conversation view

**UI Features Implemented**

- Shared chat shell layout with left rail and main panel
- Thread list with search, pinned, recent, and project grouping
- Inline rename, pin/unpin, and delete actions (local state only)
- New chat landing with prompt suggestions and composer
- Conversation view with mock messages, scope badges, and composer tools
- Not-found state for invalid thread IDs
- Mobile routing behavior (rail hides on thread route)

**Data Status**

- Thread and message data are mocked in `app/app/chat/components/mock-data.ts`
- Conversations are not persisted to Convex yet
