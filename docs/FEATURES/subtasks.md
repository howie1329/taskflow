# Subtasks

## Goal

Subtasks provide lightweight checklists under a task.

## User Stories

- As a user, I can add subtasks to a task.
- As a user, I can mark a subtask complete.
- As a user, I can edit and delete subtasks.

## MVP Scope (v1)

- Subtask CRUD under a parent task
- Completion toggle

## Data Model (Convex)

- `subtasks`
  - `userId` (string)
  - `taskId` (Id<"tasks">)
  - `title` (string)
  - `isComplete` (boolean)
  - `order` (number)
  - `createdAt` (number)
  - `updatedAt` (number)

Indexes:

- by `userId + taskId`

## UI/UX

- Render subtasks in task detail
- Quick add and reorder (optional)

## Convex API Surface (to implement)

- queries
  - `subtasks.listByTask({ taskId })`
- mutations
  - `subtasks.create({ taskId, title })`
  - `subtasks.update({ id, patch })`
  - `subtasks.setComplete({ id, isComplete })`
  - `subtasks.delete({ id })`

## Permissions & Invariants

- Only owner can access.
- Subtask `taskId` must belong to the same user.

## Acceptance Criteria

- Subtasks persist and render consistently.

## Legacy Reference (do not copy blindly)

- Legacy frontend:
  - Subtask hooks: `apps/frontend/src/hooks/tasks/subtasks/`
- Legacy backend:
  - Routes: `apps/backend/routes/v1/subtasks.js`
  - Controllers: `apps/backend/controllers/subtasks.js`

## Docs Reference

- `apps/frontend/docs/MVP.md`
- `apps/backend/docs/FEATURE_ANALYSIS_AND_RECOMMENDATIONS.md`
