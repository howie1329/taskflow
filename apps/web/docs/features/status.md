# Feature Status

This snapshot reflects the current code in `apps/web`.

## Core Workspace

| Area | Status | Notes |
| --- | --- | --- |
| Inbox | ✅ Convex-backed | Capture, archive, delete, convert to task/project/note. |
| Tasks | ✅ Convex-backed | Board + Today+ board, filters, subtasks, tags, scheduling, task details. |
| Projects | ✅ Convex-backed | Create/edit/archive/delete projects; project detail view with task board. |
| Notes | ✅ Convex-backed | Notes provider uses Convex queries/mutations with template picker creation, subtle note types, and URL-synced filters. |
| AI Chat | ✅ Convex-backed | Threads and messages are loaded from Convex; chat streams through `/api/chat`. |

## Onboarding & Settings

| Area | Status | Notes |
| --- | --- | --- |
| Onboarding | ✅ Convex-backed | Writes preferences and onboarding completion. |
| Settings | ✅ Convex-backed | Profile + preference management powered by Convex. |
| Notifications | 🚧 Placeholder UI | Route exists with empty state; no full notification feed workflow yet. |

## Marketing

| Area | Status | Notes |
| --- | --- | --- |
| Landing page | ✅ Implemented | Hero + workflow + feature panels. |
| Roadmap | ✅ Implemented | Public roadmap view. |

## Upcoming Integrations

- Wire project detail Notes tab to full notes flows.
- Expand notifications from placeholder to persisted read/unread feed behavior.
