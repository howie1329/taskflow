# Legacy Feature Inventory

This file is a short reference for what existed before the repo was cleaned down to `apps/web`.

The old `apps/frontend` and `apps/backend` implementations were removed after the Convex-based `apps/web` app became the only active product surface.

## Major Legacy Feature Areas

- Tasks: CRUD, board workflows, subtasks, priorities, project assignment
- Notes: editor flows, note-task linking, search, project grouping
- Projects: list/detail flows and project-scoped work organization
- Inbox: capture-first workflow prototype
- Schedule: early day-planning UI concepts
- AI chat: persisted threads/messages, tool execution, streaming responses
- Notifications: early feed and event concepts
- Search and context retrieval: semantic search, summarization, and RAG experimentation

## Legacy Lessons Still Worth Keeping

- Keep current docs aligned with real code, not aspirational architecture.
- Preserve tool execution state in chat UIs with clear loading, complete, and error states.
- Treat context-window management as an explicit product/system concern, not a hidden implementation detail.
- Keep package boundaries clear: pure shared utilities belong in packages, app-specific orchestration belongs with the active app.
- Avoid preserving outdated planning docs once their useful decisions have been absorbed into canonical docs.
