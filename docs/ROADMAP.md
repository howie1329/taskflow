# Roadmap (Rewrite)

This roadmap is written for the rewrite. Treat all features as not yet implemented.

## v1 Goal

Ship a cohesive solo workflow loop: capture -> organize -> execute, with AI inside the same app.

## Phase 1: Foundation (Week 1)

- Convex + Clerk integration and user-scoped access rules
- Core data model for v1 entities
- App shell and navigation (layout, sidebar/header, routing)
- Validation strategy (Zod) and error handling conventions

## Phase 2: Make It Real (Weeks 2-3)

- Inbox persistence + triage + convert-to flows
- Tasks CRUD + subtasks
- Projects CRUD + project views
- Notes CRUD + editor + basic linking

## Phase 3: Plan and Execute (Weeks 3-4)

- Schedule persistence (start with assign-to-day via `scheduledDate`)
- Search + command palette (Cmd/Ctrl+K) for jump/create/search
- Minimal in-app notifications for system feedback

## Phase 4: AI as Workplace Operator (Weeks 4-5)

- Persisted chat history (conversations/messages)
- AI actions that operate on workspace items (create/link/search/open)
- Decide AI delivery mode:
  - v1 default: non-streaming (faster, simpler)
  - optional: streaming via a Next.js route, persisting final results to Convex

## v1.1 Backlog

- Mention system + backlinks panel
- Reminders
- Recurring tasks
- Attachments
- Semantic search / embeddings
- Research library + daily digest

## Parking Lot (Post-MVP)

See `docs/FEATURES/post-mvp-parking-lot.md` for ideas we are explicitly not building in v1/v1.1.
