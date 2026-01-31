# Inbox (Capture, Triage, Convert)

## Goal

Make capture real: the user can dump thoughts fast, then convert them into structured tasks/notes/projects.

## User Stories

- As a user, I can quickly capture an inbox item.
- As a user, I can process an item: convert to task/note/project.
- As a user, I can archive/delete processed items.

## MVP Scope (v1)

- Inbox items persisted in Convex
- Convert flows:
  - inbox -> task
  - inbox -> note
  - inbox -> project
- Minimal metadata: `status` (open/archived), optional `labels`, optional `projectId`

## Non-goals (v1)

- AI-powered inbox triage (v1.1+)
- Voice capture (later)

## Data Model (Convex)

- `inboxItems`
  - `userId` (string)
  - `content` (string)
  - `status` ("open" | "archived")
  - `createdAt` (number)
  - `updatedAt` (number)
  - optional fields: `labels` (string[]), `source` ("manual" | "ai"), `metadata` (object)

Indexes:

- by `userId`
- by `userId + status`
- by `userId + createdAt`

## UI/UX

- Inbox list with fast add
- Per-item actions: convert, archive, delete
- Conversion modal(s) that prefill title/content

## Convex API Surface (to implement)

- queries
  - `inbox.listOpen()`
  - `inbox.listArchived()`
- mutations
  - `inbox.create({ content })`
  - `inbox.archive({ id })`
  - `inbox.delete({ id })`
  - `inbox.convertToTask({ id, taskFields })`
  - `inbox.convertToNote({ id, noteFields })`
  - `inbox.convertToProject({ id, projectFields })`

## Permissions & Invariants

- Only the owner can read/mutate inbox items.
- Convert operations must be atomic (create target entity + archive source) or compensate safely.

## Acceptance Criteria

- Inbox item survives refresh and reload.
- Convert creates the new entity and the inbox item is no longer in the open list.

## Legacy Reference (do not copy blindly)

- Legacy frontend:
  - Inbox prototype page: `apps/frontend/src/app/mainview/inbox/page.js`
- Legacy backend:
  - No inbox persistence existed.

## Docs Reference

- `apps/backend/docs/FEATURE_ANALYSIS_AND_RECOMMENDATIONS.md` (Inbox -> real triage)
- `apps/frontend/docs/FEATURE_GAPS_AND_IDEAS.md`
