# Notes

## Goal

Notes are the knowledge surface of the workplace. Notes should link cleanly to tasks and projects.

## User Stories

- As a user, I can create and edit notes.
- As a user, I can link notes to tasks/projects.
- As a user, I can browse notes quickly from a sidebar.

## MVP Scope (v1)

- Note CRUD
- Block-based editor
- Basic linking to tasks/projects (one or many)

## Non-goals (v1)

- Folders system
- Note version history
- /todo blocks that create tasks (possible v1.1+)

## Data Model (Convex)

- `notes`
  - `userId` (string)
  - `title` (string)
  - `description` (string)
  - `blocks` (any) (block editor payload)
  - `linkedTaskIds` (Id<"tasks">[])
  - `linkedProjectIds` (Id<"projects">[])
  - `createdAt` (number)
  - `updatedAt` (number)

Indexes:

- by `userId`
- by `userId + updatedAt`

## UI/UX

- Notes sidebar with search
- Note page with editor
- Link picker UI (tasks/projects)

## Convex API Surface (to implement)

- queries
  - `notes.list()`
  - `notes.get({ id })`
- mutations
  - `notes.create({ title, description? })`
  - `notes.update({ id, patch })`
  - `notes.delete({ id })`
  - `notes.setLinks({ id, taskIds, projectIds })`

## Permissions & Invariants

- Only owner can access.
- Linked IDs must be validated as belonging to the same user.

## Acceptance Criteria

- Notes persist, load, and save reliably.
- Links show in UI and can navigate to targets.

## Legacy Reference (do not copy blindly)

- Legacy frontend:
  - Notes list: `apps/frontend/src/app/mainview/notes/page.js`
  - Note page: `apps/frontend/src/app/mainview/notes/[id]/page.js`
  - Notes sidebar: `apps/frontend/src/presentation/components/notes/layout/NotesSideBar.js`
  - Block editor: `apps/frontend/src/presentation/components/notes/BlockEditor.js`
- Legacy backend:
  - Routes: `apps/backend/routes/v1/notes.js`
  - Controllers: `apps/backend/controllers/notes.js`
  - Ops: `apps/backend/db/operations/notes.js`

## Docs Reference

- `apps/frontend/docs/NotesFeatures.md`
- `apps/frontend/docs/NotesFeatureTodo.md`
- `apps/backend/docs/FEATURE_ANALYSIS_AND_RECOMMENDATIONS.md`
