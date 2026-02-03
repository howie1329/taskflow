# Feature Status

This snapshot reflects the current code in `apps/web`.

## Core Workspace

| Area | Status | Notes |
| --- | --- | --- |
| Inbox | ✅ Convex-backed | Capture, archive, delete, convert to task/project/note. |
| Tasks | ✅ Convex-backed | Board + Today+ board, filters, subtasks, tags, scheduling, task details. |
| Projects | ✅ Convex-backed | Create/edit/archive/delete projects; project detail view with task board. |
| Notes | 🧪 UI-only | Notes list/editor uses local mock state and URL sync. |
| AI Chat | 🧪 UI-only | Threads + messages powered by mock data; creates temp thread IDs. |

## Onboarding & Settings

| Area | Status | Notes |
| --- | --- | --- |
| Onboarding | ✅ Convex-backed | Writes preferences and onboarding completion. |
| Settings | ✅ Convex-backed | Profile + preference management powered by Convex. |

## Marketing

| Area | Status | Notes |
| --- | --- | --- |
| Landing page | ✅ Implemented | Hero + workflow + feature panels. |
| Roadmap | ✅ Implemented | Public roadmap view. |

## Upcoming Integrations

- Replace notes mock state with Convex persistence.
- Connect AI chat to Convex conversations and AI actions.
