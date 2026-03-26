# Taskflow Web Deep Dive

`apps/web` is the core Taskflow product: a personal operations workspace that combines task/project/note management with a first-class AI assistant in one app.

## Product Summary

Taskflow Web is positioned as a **solo productivity operating system**:

1. Capture incoming work in Inbox.
2. Convert and organize it into Tasks, Projects, and Notes.
3. Execute in a focused workspace.
4. Use integrated AI Chat for planning, research, and workflow actions.

This is not just a chat wrapper or plain task manager—the app combines structured personal data + AI tooling + workflow UI under one authenticated workspace.

## Tech and Runtime Shape

- **Framework**: Next.js App Router + React.
- **Data backend**: Convex (queries/mutations/actions, typed schema, indexes).
- **Auth model**: Convex Auth with server-side gate on `/app` routes.
- **AI runtime**: `/api/chat` stream endpoint with multi-provider model routing and tool execution.
- **UX system**: shadcn-style component primitives with Hugeicons-based iconography.

The architecture is strongly user-scoped: data reads/writes are tied to authenticated user identity at the backend boundary.

## Routing and Surface Areas

### Public + Auth

- `/`: marketing landing page (hero/workflow/AI operator panels).
- `/roadmap`: public roadmap.
- `/sign-in`, `/sign-up`: auth flows.

### App Workspace (`/app/*`)

- `/app` redirects to `/app/tasks`.
- `/app/inbox`: capture and triage.
- `/app/tasks`: main execution board.
- `/app/projects` and `/app/projects/[projectId]`: project organization.
- `/app/notes` and `/app/notes/[noteId]`: long-form context workspace.
- `/app/chat` and `/app/chat/[threadId]`: AI assistant threads.
- `/app/settings`: profile/preferences/model controls.
- `/app/onboarding`: first-run setup wizard.
- `/app/notifications`: currently placeholder.

The shell provides a left workspace sidebar and a conditional right inspector panel for Notes/Chat contexts.

## App Shell and User Flow Control

The `AppShell` is a key product behavior layer:

- Central nav for Inbox, Notifications, Tasks, Projects, AI Chat, Notes, Settings.
- Route-aware sidebar switching (workspace nav vs thread rail vs notes rail).
- Right-side inspector behavior when in Chat/Notes.
- **Onboarding gating**: non-onboarded users are redirected to onboarding before normal workspace use.

This ensures first-run preference setup (profile, AI defaults, chat visibility, notifications) is completed before full app usage.

## Core Features Breakdown

### 1) Inbox (Capture-first)

**Goal**: minimize friction at capture time.

Current capabilities:

- Quick text capture to `inboxItems`.
- Open/archived tabs with counts.
- Search/filter, archive/unarchive/delete.
- Convert items into tasks/projects (note conversion path exists in UI plan, parity may vary).
- Mobile action sheet handling.

Why it matters: Inbox acts as the app’s intake valve so users can defer structure until later.

### 2) Tasks (Execution center)

**Goal**: turn captured/organized work into day-to-day execution.

Current capabilities:

- Board-based workflow with multiple statuses.
- Today+Board workflow support.
- Create/edit/delete tasks.
- Subtasks and tagging.
- Filters across status/priority/project/scheduling context.
- Details and creation sheets.

Task records support richer metadata than a basic to-do list (priority, schedule, context, estimated duration, source, ordering, AI fields).

### 3) Projects (Container + context)

**Goal**: group related work and provide scoped navigation.

Current capabilities:

- Active/archived project views.
- Search by title/description.
- Create/edit/archive/unarchive/delete.
- Detail route with task-focused context.
- Project deletion unassigns tasks before delete.

Known gap: project-level note experience is still not fully integrated end-to-end.

### 4) Notes (Long-form workspace)

**Goal**: keep durable context and thinking in the same product as tasks.

Current capabilities:

- Create/select/update/delete/pin/move notes.
- Template-driven note creation (blank + typed templates).
- URL-synced filters for project/type/search/view mode.
- View modes (`byProject`, `recent`, `pinned`).
- Desktop two-pane and mobile panel-oriented UX.
- Autosave state indicator.
- Reviewer metadata support for structured writing feedback.

Architecture highlight: `NotesProvider` centralizes filtering, grouping, routing sync, CRUD actions, and note-reviewer handoff state.

### 5) AI Chat (Assistant + tools)

**Goal**: bring AI execution into the workspace rather than sending users to external tools.

Current capabilities:

- Thread list with search/pin/rename/delete patterns.
- Thread view with streaming assistant responses.
- Model/mode/project controls at composition time.
- Tool activity summaries + expandable detail cards.
- Optional preferences for actions/tool details/reasoning visibility.
- Usage metering (daily + total messages).

AI architecture patterns:

- Conversation persistence in Convex (`thread`, `threadMessages`).
- Stream generation via `/api/chat`.
- Mode-aware tool availability (`Basic`, `Advanced`, `Finance`, `Research`, `Social`).
- Provider/tool aggregation under `lib/AITools/*`.
- Cost/usage accounting attached to messages and thread totals.
- Context compaction + thread summary workflow hooks.

This is a product differentiator: the assistant is “inside” the same data model as tasks/projects/notes.

### 6) Settings

**Goal**: central user control for behavior and defaults.

Current capabilities:

- Profile management.
- Preferences that affect tasks/chat behavior.
- AI settings tab with model catalog visibility and chat UX toggles.
- Usage panel (messages today and total).

### 7) Onboarding

**Goal**: configure minimum viable personal workspace before usage.

Wizard steps:

1. Profile basics
2. Default model
3. AI Chat visibility options
4. Notification preference + completion marker

Finishing onboarding writes completion metadata and routes user into tasks workspace.

### 8) Notifications

Current state:

- Placeholder UI route with empty state copy.

Intended direction:

- persisted records,
- read/unread filtering,
- actionable deep links into related entities.

## Data Model and Persistence Strategy

Taskflow Web uses a broad Convex schema that includes:

- identity/profile/preferences tables,
- workspace entities (`inboxItems`, `tasks`, `subtasks`, `projects`, `tags`, `notes`),
- chat entities (`thread`, `threadMessages`, usage tables),
- model metadata (`availableModels`, `baseModels`),
- notification records.

A notable pattern is index-first querying and post-filtering only where needed; this keeps common views efficient while maintaining straightforward application code.

## Security and Multi-Tenancy Behavior

The system is built around user-scoped access:

- Convex functions resolve user identity server-side (`getAuthUserId`).
- Queries/mutations use user-indexed lookups where possible.
- Direct entity operations validate ownership before returning or mutating.
- Frontend never provides `userId` for authorization decisions.

This keeps app-level multi-tenancy simple and explicit.

## Product Positioning (What it is)

Taskflow Web is best described as:

- **A personal workflow OS** for solo operators.
- **A unified workspace** combining capture, planning, execution, and knowledge management.
- **An AI-augmented productivity product** where tool-driven assistant behavior is integrated into the native app model.

It is currently beyond MVP in core workflows (inbox/tasks/projects/notes/chat/settings/onboarding) with notifications and some project-notes integration still maturing.

## Practical Maturity Snapshot

### Strong / active

- Workspace shell and core nav
- Inbox capture + conversion
- Task board execution surface
- Projects CRUD + detail workspace
- Notes with strong provider architecture
- Convex-backed AI threads/messages + streaming chat route
- Settings + onboarding persistence

### In progress / partial

- Notifications feed workflows
- Full project-notes parity on project detail surfaces

## Why this product shape is coherent

Taskflow Web’s product logic is internally consistent:

- Every feature supports the same loop (capture → organize → execute → reflect/assist).
- AI is attached to workflow entities and thread history instead of living as an isolated chatbot.
- Preferences/onboarding directly control how much AI detail users see, allowing novice-to-power-user tuning.

The result is a practical, integrated productivity environment rather than a disconnected set of tools.
