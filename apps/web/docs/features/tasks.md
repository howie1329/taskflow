# Tasks

Route: `/app/tasks`

## Purpose

Primary execution workspace for planned work.

## Current Behavior

- Task board with status columns, Today+Board split, and List (grouped by status)
- Today+Board workflow
- Create/edit/delete tasks
- Subtasks and tags support
- Filtering by status, priority, project, tag, and scheduling context
- Details sheet and create task sheet flows

## Architecture

- Entry page: `app/app/tasks/page.tsx`
- Feature module composition:
  - `TaskFeature.Provider`
  - `TaskFeature.Toolbar` (search, filters popover / mobile sheet, hide completed, view tabs)
  - `TaskFeature.Content`
  - `TaskFeature.DetailsSheet`
  - `TaskFeature.CreateSheet`

## Data

- Convex-backed:
  - `tasks`
  - `subtasks`
  - `tags`
  - `projects`

## Notes

- This is one of the highest-density surfaces in the app.
- Prefer incremental visual updates over major interaction rewrites unless user flow changes.
