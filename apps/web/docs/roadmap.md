# Roadmap (apps/web)

This roadmap tracks the main Taskflow app in `apps/web`.

## Current State

- Core workspace routes are live (inbox, tasks, projects, notes, chat, settings, onboarding).
- Convex is the primary data layer for product entities.
- AI chat supports thread history + tool/action rendering.

## Near-Term Priorities

- Finish UI consistency pass across all app surfaces using `ui-guidelines.md`.
- Harden type safety and lint health in shared UI/state modules.
- Complete project-notes integration on project detail views.
- Expand notifications from placeholder route to persisted feed behavior.

## Product Priorities

1. Capture and triage (`/app/inbox`)
2. Organize and execute (`/app/tasks`, `/app/projects`, `/app/notes`)
3. Assist and automate (`/app/chat`)
4. Personalize and configure (`/app/settings`, `/app/onboarding`)

## Backlog Themes

- Schedule refinement and stronger planning workflows
- Search and command navigation improvements
- v1.1 collaboration-adjacent features (mentions/backlinks, reminders, recurring behavior)

## Documentation Rule

When roadmap scope changes, update:

- `features/status.md`
- any affected feature doc in `features/`
- architecture docs when data or flow changes
