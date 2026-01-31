# Projects

## Goal

Projects group tasks and notes into meaningful work buckets.

## User Stories

- As a user, I can create and edit projects.
- As a user, I can view tasks within a project.
- As a user, I can archive/delete projects.

## MVP Scope (v1)

- Project CRUD
- Basic project list + project detail view
- Task association via `task.projectId`

## Non-goals (v1)

- Team members
- Gantt chart

## Data Model (Convex)

- `projects`
  - `userId` (string)
  - `title` (string)
  - `description` (string)
  - `status` ("active" | "archived")
  - `createdAt` (number)
  - `updatedAt` (number)

Indexes:

- by `userId`
- by `userId + status`

## UI/UX

- Projects sidebar/list
- Create/edit project dialog
- Project page: task list/board filtered by project

## Convex API Surface (to implement)

- queries
  - `projects.list()`
  - `projects.get({ id })`
- mutations
  - `projects.create({ title, description? })`
  - `projects.update({ id, patch })`
  - `projects.archive({ id })`
  - `projects.delete({ id })`

## Permissions & Invariants

- Only owner can access.
- Deleting a project must define behavior for its tasks (unset projectId or archive tasks).

## Acceptance Criteria

- Projects can be created/edited/deleted and tasks can be assigned.

## Legacy Reference (do not copy blindly)

- Legacy frontend:
  - Projects list: `apps/frontend/src/app/mainview/projects/page.js`
  - Project page: `apps/frontend/src/app/mainview/projects/[id]/page.js`
  - Sidebar + create dialog: `apps/frontend/src/presentation/components/projects/layout/ProjectSidebar.js`
- Legacy backend:
  - Routes: `apps/backend/routes/v1/projects.js` (create + fetch only)
  - Controllers: `apps/backend/controllers/projects.js`

## Docs Reference

- `apps/backend/docs/FEATURE_ANALYSIS_AND_RECOMMENDATIONS.md` (Projects CRUD completion)
- `apps/frontend/docs/FEATURE_GAPS_AND_IDEAS.md`
