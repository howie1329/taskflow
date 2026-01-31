# Schedule

## Goal

Users can plan their work by placing tasks onto upcoming days. This must persist.

## User Stories

- As a user, I can assign a task to a specific day.
- As a user, I can see upcoming days and tasks scheduled for them.
- As a user, I can drag tasks between days.

## MVP Scope (v1)

- Persist day assignment for tasks (`scheduledDate`)
- Schedule view for a rolling set of days

## Non-goals (v1)

- Full time-blocking (time + duration)
- External calendar sync

## Data Model (Convex)

Option A (recommended for v1):

- Store `scheduledDate` on `tasks` as a YYYY-MM-DD string.

Option B (later):

- Introduce `scheduleBlocks` for time-of-day and duration.

Indexes:

- `tasks` by `userId + scheduledDate`

## UI/UX

- Multi-column upcoming days view
- Drag-and-drop tasks between columns
- "Brain dump" column can be modeled as `scheduledDate = null`

## Convex API Surface (to implement)

- mutation
  - `tasks.setScheduledDate({ id, scheduledDate })`
- queries
  - `tasks.listByScheduledDateRange({ start, end })`

## Permissions & Invariants

- Only owner can schedule tasks.

## Acceptance Criteria

- Scheduling persists across reload.
- Drag-and-drop updates the underlying task.

## Legacy Reference (do not copy blindly)

- Legacy frontend:
  - Schedule prototype page: `apps/frontend/src/app/mainview/schedule/page.js`
- Legacy backend:
  - No schedule persistence existed.

## Docs Reference

- `apps/backend/docs/FEATURE_ANALYSIS_AND_RECOMMENDATIONS.md` (Schedule persistence)
- `apps/frontend/docs/FEATURE_GAPS_AND_IDEAS.md`
