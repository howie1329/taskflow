# Mentions + Backlinks (v1.1)

## Goal

Connect tasks, notes, projects, and chat via @mentions and backlinks.

## User Stories

- As a user, I can type `@` and mention a task/note/project.
- As a user, I can click a mention to navigate.
- As a user, I can see backlinks (what references this item).

## Scope (v1.1)

- Mention autocomplete in:
  - chat input
  - note editor
  - task description
- Persist mention relationships
- Backlinks panel on tasks/notes/projects

## Data Model (Convex)

- `mentions`
  - `userId`
  - `sourceType` ("note" | "task" | "message")
  - `sourceId` (Id<...>)
  - `targetType` ("task" | "note" | "project")
  - `targetId` (Id<...>)
  - `createdAt`

Indexes:

- by `userId + targetType + targetId` (for backlinks)
- by `userId + sourceType + sourceId`

## UI/UX

- Autocomplete dropdown with keyboard navigation
- Mentions render as rich tokens
- Backlinks panel shows referencing items

## Convex API Surface (to implement)

- `mentions.parseAndUpsertForSource(...)`
- `mentions.listBacklinks({ targetType, targetId })`

## Acceptance Criteria

- Mentioning inserts a stable reference and renders as a clickable token.
- Backlinks are correct and user-scoped.

## Legacy Reference (do not copy blindly)

- No mention system implemented.

## Docs Reference

- `apps/frontend/docs/MENTION_SYSTEM_GUIDE.md`
- `apps/backend/docs/FEATURE_ANALYSIS_AND_RECOMMENDATIONS.md`
