# AI Chat

## Goal

AI chat lives inside the workplace and can operate on workspace data (create/link/search/open). The chat history persists.

## User Stories

- As a user, I can chat with an assistant inside Taskflow.
- As a user, I can start new conversations and return to them later.
- As a user, I can ask the AI to create tasks/notes/projects and link items.

## MVP Scope (v1)

- Persisted conversations and messages
- Basic assistant responses (non-streaming by default)
- AI "actions" that call Convex mutations (create/link/search/open)

## Non-goals (v1)

- Multimodal uploads
- Proactive notifications/memory
- Advanced context retrieval/summarization (opt-in later)

## Data Model (Convex)

- `conversations`
  - `userId` (string)
  - `title` (string)
  - `createdAt` (number)
  - `updatedAt` (number)
- `messages`
  - `userId` (string)
  - `conversationId` (Id<"conversations">)
  - `role` ("user" | "assistant" | "system" | "tool")
  - `content` (string)
  - `createdAt` (number)

Indexes:

- conversations by `userId + updatedAt`
- messages by `conversationId + createdAt`

## UI/UX

- Chat list + chat page
- Conversation history in sidebar
- Tool/action UI that feels native (not logs)

## Convex API Surface (to implement)

- queries
  - `conversations.list()`
  - `conversations.get({ id })`
  - `messages.listByConversation({ conversationId })`
- mutations
  - `conversations.create()`
  - `conversations.rename({ id, title })`
  - `conversations.delete({ id })`
  - `messages.append({ conversationId, role, content })`
- action
  - `ai.sendMessage({ conversationId, content, model? })`
    - writes user message
    - calls provider
    - writes assistant message
    - returns assistant response

## Permissions & Invariants

- Only owner can access conversation/message data.
- If we add tools/artifacts later, persist tool outputs separately from chat text.

## Acceptance Criteria

- Chat persists and reloads without data loss.
- AI can create tasks/notes/projects and link them.

## Legacy Reference (do not copy blindly)

- Legacy frontend:
  - Chat pages: `apps/frontend/src/app/mainview/aichat/page.js`, `apps/frontend/src/app/mainview/aichat/[id]/page.js`
  - Providers: `apps/frontend/src/presentation/components/aiChat/providers/`
  - Suggested messages hook: `apps/frontend/src/hooks/ai/useSuggestionMessages.js`
- Legacy backend:
  - Routes: `apps/backend/routes/v1/conversations.js`, `apps/backend/routes/v1/ai.js`
  - Artifacts: `apps/backend/docs/ARTIFACT_SYSTEM.md`
  - Chat history analysis: `apps/backend/docs/CHAT_HISTORY_ANALYSIS.md`

## Docs Reference

- `apps/backend/docs/ARTIFACT_SYSTEM.md`
- `apps/backend/docs/CHAT_HISTORY_ANALYSIS.md`
- `apps/backend/docs/CHAT_HISTORY_RECOMMENDATIONS.md`
- `apps/frontend/docs/AI_Chat_Enhancement_Roadmap.md`
