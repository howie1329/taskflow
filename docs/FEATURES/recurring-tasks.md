# Recurring Tasks (v1.1)

## Goal

Support tasks that repeat on a schedule.

## User Stories

- As a user, I can set a task to recur daily/weekly.
- As a user, completing an instance schedules the next one.

## Scope (v1.1)

- Recurrence rules (start simple)
- Instance generation logic

## Data Model (Convex)

- Extend `tasks`:
  - `recurrence` (object | null) (frequency, interval, daysOfWeek, etc.)

## Convex API Surface (to implement)

- mutations
  - `tasks.setRecurrence({ id, recurrence })`
- scheduled function
  - creates next instances based on recurrence

## Acceptance Criteria

- Recurring tasks produce consistent future instances.

## Docs Reference

- `apps/backend/docs/FEATURE_ANALYSIS_AND_RECOMMENDATIONS.md` (Recurring tasks)
