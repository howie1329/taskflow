# Inbox

Route: `/app/inbox`

## Purpose

Capture quickly, triage later. Inbox is the lowest-friction entry point for new work.

## Current Behavior

- Capture freeform text into inbox items
- Search/filter by open vs archived state
- Archive, unarchive, delete
- Convert inbox item to:
  - task
  - project
  - note (UI path present; implementation parity may vary by flow)
- Mobile action sheet for item actions

## Data and Hooks

- Uses Convex-backed hooks in `hooks/inbox/*`:
  - `useInboxItems`
  - `useInboxCounts`
  - `useInboxActions`
- Page container: `app/app/inbox/page.jsx`

## UX Notes

- Includes loading skeletons and toast feedback for actions
- Capture-first layout is prioritized over dense metadata
- New item animation is used to confirm successful capture
