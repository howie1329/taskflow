# Projects

Routes:

- `/app/projects`
- `/app/projects/[projectId]`

## Purpose

Organize related tasks (and eventually deeper project-level artifacts).

## Current Behavior

- Project list with active/archived tabs
- Search projects by title/description
- Create/edit/archive/unarchive/delete project
- Project detail route with task-focused workspace

## Data

- Convex-backed via `convex/projects.ts`
- Uses user-scoped project queries and ownership checks

## Notes

- Project detail notes integration remains partial/stubbed in current UI.
- Deleting a project unassigns related tasks from the project scope.
