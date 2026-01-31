# Tasks

## Goal

Tasks are the primary execution unit. Users can create, organize, and complete tasks reliably.

## User Stories

- As a user, I can create a task quickly.
- As a user, I can edit status/priority/due date/labels.
- As a user, I can complete and un-complete tasks.
- As a user, I can view tasks by project and by schedule day.

## MVP Scope (v1)

- Task CRUD
- Fields: title, description (optional), status, priority, dueDate (optional), labels (optional)
- Project association (optional)
- Completion toggle

## Non-goals (v1)

- Recurring tasks (v1.1)
- Dependencies and graphs (later)
- Activity log (later)
- Bulk actions (v1.1+)

## Data Model (Convex)

- `tasks`
  - `userId` (string)
  - `title` (string)
  - `description` (string)
  - `status` ("todo" | "inProgress" | "done")
  - `priority` ("none" | "low" | "medium" | "high")
  - `dueDate` (number | null)
  - `projectId` (Id<"projects"> | null)
  - `scheduledDate` (string | null) (v1 schedule: assign to day)
  - `createdAt` (number)
  - `updatedAt` (number)

Indexes:

- by `userId`
- by `userId + status`
- by `userId + projectId`
- by `userId + scheduledDate`

## UI/UX

- Task list view with filters
- Task detail view (edit fields)
- Completion toggle

## Convex API Surface (to implement)

- queries
  - `tasks.list({ status?, projectId?, scheduledDate? })`
  - `tasks.get({ id })`
- mutations
  - `tasks.create({ ... })`
  - `tasks.update({ id, patch })`
  - `tasks.setComplete({ id, isComplete })`
  - `tasks.delete({ id })`

## Permissions & Invariants

- Only owner can access.
- `status` and `priority` must be validated.
- If `projectId` set, project must belong to the same user.

## Acceptance Criteria

- CRUD works and stays consistent across views.
- Tasks can be filtered by status/project/day.

## Legacy Reference (do not copy blindly)

- Legacy frontend:
  - Tasks page: `apps/frontend/src/app/mainview/task/page.js`
  - Task create dialog: `apps/frontend/src/presentation/components/task/CreateTaskDialog.js`
  - Task providers: `apps/frontend/src/presentation/components/task/Providers/`
  - Task hooks: `apps/frontend/src/hooks/tasks/`
- Legacy backend:
  - Routes: `apps/backend/routes/v1/tasks.js`
  - Controllers: `apps/backend/controllers/tasks.js`
  - Ops: `apps/backend/db/operations/tasks.js`

## Docs Reference

- `apps/frontend/docs/MVP.md`
- `apps/backend/docs/FEATURE_ANALYSIS_AND_RECOMMENDATIONS.md`
