# Routing Map

Taskflow Web uses the Next.js App Router. Routes fall into three groups:

1. **Public marketing** (landing + roadmap)
2. **Auth** (sign-in/sign-up)
3. **App workspace** (inbox, tasks, projects, notes, chat, settings, onboarding)

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
| `/app/notes` | Notes list shell + empty/select state | Convex (`notes`, `projects`) via NotesProvider |
| `/app/notes/[noteId]` | Note editor route | Convex (`notes`) |
| `/app/chat` | AI chat landing/composer | Convex thread bootstrap + `/api/chat` streaming |
| `/app/chat/[threadId]` | AI chat conversation view | Convex (`thread`, `messages`) + `/api/chat` |
| `/app/settings` | Profile/preferences/AI settings | Convex (`userProfiles`, `userPreferences`) |
| `/app/onboarding` | New user onboarding wizard | Convex (`userPreferences`) |
| `/app/notifications` | Notifications placeholder page | UI-only placeholder |

## Route Layout Notes

- `/app/chat` uses a shared chat shell layout that provides the left rail and dialog state.
- `/app/notes` uses a provider-driven shell with URL-synced filter/view/search state.
- `/app` routes are client components where data is fetched via `convex/react` hooks.
