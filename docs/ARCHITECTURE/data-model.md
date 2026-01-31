# Data Model (Rewrite)

This document defines the initial Convex collections for v1.

## Collections (v1)

- `projects`
- `tasks`
- `subtasks`
- `notes`
- `inboxItems`
- `conversations`
- `messages`
- `notifications`

Common fields:

- `userId` (string)
- `createdAt` (number)
- `updatedAt` (number)

## Relationships

- task -> project: `tasks.projectId`
- subtask -> task: `subtasks.taskId`
- note -> tasks/projects: `notes.linkedTaskIds`, `notes.linkedProjectIds`
- message -> conversation: `messages.conversationId`

## Index Strategy

- Always index by `userId` for list queries.
- Add composite indexes for the main product views:
  - tasks by `userId + status`
  - tasks by `userId + projectId`
  - tasks by `userId + scheduledDate`
  - subtasks by `userId + taskId`
  - notes by `userId + updatedAt`
  - conversations by `userId + updatedAt`
  - messages by `conversationId + createdAt`

## v1.1 Extensions

- reminders: `tasks.reminderAt`
- recurring tasks: `tasks.recurrence`
- attachments: `attachments`
- mentions/backlinks: `mentions`
