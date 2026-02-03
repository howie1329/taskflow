# Routing Map

Taskflow Web uses the Next.js App Router. Routes fall into three groups:

1. **Public marketing** (landing + roadmap)
2. **Auth** (sign-in/sign-up)
3. **App workspace** (inbox, tasks, projects, notes, chat, settings)

## Public Routes

| Route | Purpose | Data Source |
| --- | --- | --- |
| `/` | Marketing landing page | Static components |
| `/roadmap` | Product roadmap | Static content |

## Auth Routes

| Route | Purpose | Data Source |
| --- | --- | --- |
| `/sign-in` | User sign-in | Convex Auth UI |
| `/sign-up` | User sign-up | Convex Auth UI |

## App Workspace Routes

| Route | Purpose | Data Source |
| --- | --- | --- |
| `/app` | Redirects to tasks | Next.js redirect |
| `/app/inbox` | Capture + triage inbox items | Convex (`inboxItems`) |
| `/app/tasks` | Task board + filters + subtasks | Convex (`tasks`, `subtasks`, `tags`, `projects`) |
| `/app/projects` | Project list, create/archive | Convex (`projects`) |
| `/app/projects/[projectId]` | Project detail + task board | Convex (`projects`, `tasks`, `subtasks`, `tags`) |
| `/app/notes` | Notes UI (project grouping, editor) | Local mock state |
| `/app/chat` | AI chat landing | Local mock state |
| `/app/chat/[threadId]` | AI chat conversation view | Local mock state |
| `/app/settings` | Profile/preferences/AI settings | Convex (`userProfiles`, `userPreferences`) |
| `/app/onboarding` | New user onboarding wizard | Convex (`userPreferences`) |

## Route Layout Notes

- `/app/chat` uses a shared chat shell layout that provides the left rail and dialog state.
- `/app` routes are client components where data is fetched via `convex/react` hooks.
