# TaskFlow — Missing Features & High-Value Additions

This document summarizes what’s already implemented across the **TaskFlow frontend** (`taskflow/`) and **backend** (`taskflow-backend/`), and proposes **missing features** and **sensible next additions** in a prioritized roadmap.

---

## What you already have (from code)

### Frontend (Next.js)

- **Auth**: Clerk is wired in.
- **Tasks**
  - CRUD UI with **status**, **priority**, **due date (date-only)**, **labels**, **subtasks**
  - Task detail sheet/dialog
  - **Kanban-style board** (drag/drop updates local state)
- **Projects**
  - Project page + tasks-by-project view
  - Realtime invalidations via sockets
- **Notes**
  - Notes list + editor using **BlockNote** (`blocks` stored)
  - Save/delete flows
  - Sockets for invalidation
- **Schedule**
  - **5-column “next days” scheduler** with DnD and “Brain Dump” column
  - Currently stores “scheduled events” in local component state
- **Inbox**
  - Capture UI, but it’s **local-only** (no API persistence)
- **AI Chat**
  - Conversations, streaming via `@ai-sdk/react`
  - Model selection
  - “Smart context” concept
  - Tool-message rendering hooks
  - Sidebars/providers

### Backend (Express + Drizzle + Postgres + vectors + BullMQ)

- **Routes**
  - `/tasks`, `/subtasks`, `/notes`, `/projects`, `/notifications`, `/search`, `/conversations`, `/ai/models`
- **Schema highlights**
  - `tasks`: `title`, `description`, `date`, `status`, `priority`, `labels[]`, `projectId`, `isCompleted`, `vector`
  - `notes`: `title`, `description`, `blocks`, `taskId`, `linkedTask[]`, `vector`
  - `projects`: `title`, `description`, `deadline`, `tags`, `isComplete`
- **AI infra**
  - Conversation summarization worker + embedding/search support exists

---

## Biggest missing features (and why they matter)

## 1) “Core product completeness” gaps (highest ROI)

### Missing: Inbox → real triage

Your Inbox page is a prototype (local state only). A core “capture → process later” loop is a major expected feature in modern task apps.

- **Add**
  - Persist inbox items (DB + CRUD endpoints)
  - “Convert to task / note / project” actions
  - Quick categorize (labels, project, due date) + archive

### Missing: Schedule persistence + time model

Schedule currently doesn’t write back to tasks (it creates local `eventData`).

- **Add**
  - Persist “scheduled date/time block” on a task (or create a `task_events` table)
  - Time-of-day + duration (estimate/actual), not just a date string
  - Basic recurring/time-blocking

### Missing: Projects update/delete endpoints

Backend has `create` + `fetch`, but no `/projects/:id` update/delete routes exposed.

- **Add**
  - Update project title/description/deadline/tags
  - Archive/delete project and handle cascades

### Missing: Reminders

You have notifications infrastructure, but no “task due soon” reminder system.

- **Add**
  - Reminder timestamps per task
  - Background job/cron to enqueue notifications
  - In-app + (later) push/email

---

## 2) Security + multi-tenancy correctness (must-fix before adding many features)

These aren’t “features”, but they block safe scaling.

### Missing: User-scoped search

Backend `smartSearch` queries **all** tasks/notes/messages with no `userId` filter.

- **Risk**: Cross-user data leak risk. Fix before promoting “global search”.

### Missing: Ownership checks on some ops

Examples visible in ops:

- `taskOps.findByProjectId(projectId)` doesn’t include `userId`
- `noteOps.findById/update/delete` don’t include `userId`
- `taskOps.markComplete/markIncomplete` don’t include `userId`

### Missing: Input validation

Docs correctly call out missing validation; it’s still absent broadly.

- **Add** Zod schemas on API boundaries (and optionally client-side too)

### Missing: Markdown sanitization in AI chat

Docs flag XSS risk with `react-markdown`.

- **Add** sanitization (e.g., `rehype-sanitize`) and ensure safe rendering defaults

---

## 3) Task features users expect next

Based on your current task schema + UI, the “natural” additions are:

- **Recurring tasks** (daily/weekly/custom) + “skip/complete this instance”
- **Task dependencies** (“blocked by”, “blocks”) and basic critical path indicators (especially since you want Gantt later)
- **Task comments + activity log** (even in single-user mode, useful for audit/history)
- **Attachments** (files/links) on tasks and notes
- **Bulk actions** (select many tasks → set status/labels/project/delete)
- **Saved filters / smart lists** (e.g., “Today”, “Overdue”, “High priority”, “No due date”)
- **Templates** (task templates, project templates, checklist templates)

---

## 4) Notes / knowledge features that fit your architecture

You already store `blocks` and have `linkedTask[]`, so these fit well:

- **Backlinks / bidirectional links** between notes ↔ tasks ↔ projects
- **Tagging for notes** (separate from tasks’ `labels[]`), plus a unified “tag index”
- **Note version history** (even simple snapshots)
- **Global search UX** across notes/tasks (once user-scoped search is fixed)
- **Web clipper / “save to inbox”** (later, but a strong differentiator)

---

## 5) AI features that make sense given what you built

Your `docs/AI_CHAT_ANALYSIS.md` already identifies key missing UX items; the highest-value ones:

### Must-have chat UX

- **Edit a sent message → regenerate**
- **Retry/regenerate** assistant response
- **Better error UI** (retry button, offline states)
- **Conversation organization** (folders/tags/archive; sidebar previews)

### High-impact integrations

- **Create task / create project / schedule task** directly from chat tool actions
- **Citations** for web search tool output (store sources and render them)
- **File upload** (PDF/image) for modern parity (requires backend storage + model support)

### Mention system (ties everything together)

You have a full mention-system guide (`docs/MENTION_SYSTEM_GUIDE.md`) but it’s not implemented.

- **Add**: `@task`, `@note`, `@project` mentions across **chat + notes + tasks**

---

## 6) “Polish features” that are surprisingly important

- **Keyboard shortcuts / command palette** (create task, search, jump to project)
- **PWA + offline-first basics** (called out in MVP docs; even limited offline caching helps)
- **Accessibility pass** (focus states, ARIA in chat especially)
- **Analytics dashboard** (mentioned in MVP docs; not reflected as a core product surface yet)

---

## Suggested roadmap (what to add in what order)

### Phase A — Make what’s there “real”

- Inbox persistence + convert-to-task
- Schedule persistence (writing to tasks/events)
- Projects update/delete
- User-scoped search + ownership checks
- Zod validation + markdown sanitization

### Phase B — “Best-in-class personal task manager”

- Recurring tasks + reminders
- Saved filters/smart lists + bulk actions
- Task templates + lightweight activity log
- Notes backlinks + tagging

### Phase C — Differentiators

- AI-driven inbox triage (“turn these 12 captures into tasks/projects”)
- Mention system across chat/notes/tasks
- Calendar sync (Google/Outlook) once the internal schedule model is solid
