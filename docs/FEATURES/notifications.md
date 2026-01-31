# Notifications (In-App)

## Goal

Deliver lightweight feedback and reminders in-app.

## User Stories

- As a user, I can see recent notifications.
- As a user, I can mark notifications read and clear them.

## MVP Scope (v1)

- In-app notifications list
- Mark read / delete
- Used for system feedback (convert success, errors, reminders later)

## Non-goals (v1)

- Email or push notifications

## Data Model (Convex)

- `notifications`
  - `userId` (string)
  - `title` (string)
  - `content` (string)
  - `isRead` (boolean)
  - `createdAt` (number)

Indexes:

- by `userId + isRead`
- by `userId + createdAt`

## UI/UX

- Notification popover (header)
- Unread badge count

## Convex API Surface (to implement)

- queries
  - `notifications.listUnread()`
  - `notifications.listRecent()`
- mutations
  - `notifications.markRead({ id })`
  - `notifications.delete({ id })`
  - internal helper: `notifications.create({ title, content })`

## Permissions & Invariants

- Only owner can access.

## Acceptance Criteria

- Notifications persist; unread count updates.

## Legacy Reference (do not copy blindly)

- Legacy frontend:
  - Notifications UI: `apps/frontend/src/presentation/components/Layout/AppHeader.js`
- Legacy backend:
  - Routes: `apps/backend/routes/v1/notifications.js`

## Docs Reference

- `apps/frontend/docs/MVP.md`
- `apps/backend/docs/FEATURE_ANALYSIS_AND_RECOMMENDATIONS.md`
