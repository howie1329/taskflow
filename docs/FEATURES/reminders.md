# Reminders (v1.1)

## Goal

Remind users about due/scheduled tasks via in-app notifications.

## User Stories

- As a user, I can set a reminder time for a task.
- As a user, I receive an in-app notification when a reminder triggers.

## Scope (v1.1)

- Reminder fields on tasks
- Scheduled job that creates notifications
- Snooze (optional)

## Data Model (Convex)

- Extend `tasks`:
  - `reminderAt` (number | null)

## Convex API Surface (to implement)

- mutations
  - `tasks.setReminder({ id, reminderAt })`
- scheduled function
  - scans due reminders and creates notifications

## Acceptance Criteria

- Reminders trigger reliably and only for the owner.

## Legacy Reference (do not copy blindly)

- Legacy backend had notifications infrastructure, but no reminder system.

## Docs Reference

- `apps/backend/docs/FEATURE_ANALYSIS_AND_RECOMMENDATIONS.md` (Reminders system)
