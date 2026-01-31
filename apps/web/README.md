# Taskflow (Web) — v1 Rewrite

Taskflow is a solo AI-assisted workplace: manage projects, tasks, and notes in one place, with an integrated AI chat to avoid tab-hopping.

This app (`apps/web`) is the Convex-first rewrite. The legacy implementation remains in:

- `apps/frontend` (legacy Next.js app)
- `apps/backend` (legacy Express/Drizzle/Redis/BullMQ)

## Goals (v1)

Ship a cohesive personal workflow loop:

1. Capture (Inbox)
2. Organize (Projects / Tasks / Notes)
3. Execute (Schedule)
4. Assist (AI inside the workspace)

## MVP Scope (v1)

Core entities:

- Inbox items (capture + triage + convert)
- Tasks (status/priority/labels/subtasks, due date)
- Projects (CRUD + project views)
- Notes (block editor + links to tasks/projects)
- Schedule (persisted “assign to day” at minimum)
- AI chat (persisted conversations/messages; actions that operate on workspace items)

Core workflows:

- Capture an inbox item → convert to task/note/project
- Create tasks and organize into projects
- Create notes and link to tasks/projects
- Schedule tasks (assign to a day) and view upcoming days
- Use AI chat to: create task/note/project, link items, and navigate to items

Non-goals for v1:

- Team collaboration / multi-user workspaces
- External calendar sync (Google/Outlook)
- Research library + daily digest
- Mention system/backlinks (planned v1.1+)
- Semantic vector search (planned v1.1+)
- Full reminders engine (planned after schedule model is solid)

## Roadmap

### Phase 1 — Foundation (Week 1)

- Convex schema + auth rules (Clerk identity -> user-scoped data)
- Base UI shell: layout, navigation, command entry points
- Core types + validation strategy (Zod)

### Phase 2 — “Make It Real” (Weeks 2–3)

- Inbox persistence + convert flows (task/note/project)
- Tasks CRUD + subtasks
- Projects CRUD + project task views
- Notes CRUD + editor + basic linking

### Phase 3 — Plan & Execute (Weeks 3–4)

- Schedule persistence (start with `scheduledDate` / day assignment)
- Polished navigation: command palette (Cmd/Ctrl+K) for jump/create/search
- Minimal in-app notifications for system feedback

### Phase 4 — AI as Workplace Operator (Weeks 4–5)

- Persisted chat history
- AI actions: create/link/search/open items
- Decide streaming approach (non-streaming first, optional streaming route later)

### v1.1+ (Backlog)

- Mention system + backlinks panel
- Reminders
- Recurring tasks
- Semantic search / embeddings
- Research library + daily digest

## Tech Stack

- Next.js (App Router) + React
- Convex (backend)
- Clerk (auth)
- Tailwind CSS + shadcn/ui
- Zod (validation)

## Requirements

- Node.js 20+
- npm
- A Convex deployment
- Clerk keys (publishable + secret)

## Setup

Install dependencies from repo root:

```bash
npm install
```

Environment variables live in `apps/web/.env.local` (not committed).
At minimum:

```bash
# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

Tip: running `npm run dev:backend` will guide you through creating a Convex deployment and will write the Convex env vars.

## Development

Run frontend + convex dev together:

```bash
npm run dev --workspace=@taskflow/web
```

Or separately:

```bash
npm run dev:frontend --workspace=@taskflow/web
npm run dev:backend --workspace=@taskflow/web
```

Frontend: http://localhost:3000

## Useful Scripts

```bash
npm run dev --workspace=@taskflow/web
npm run build --workspace=@taskflow/web
npm run start --workspace=@taskflow/web
npm run lint --workspace=@taskflow/web
```

## Notes

- `convex/_generated` is generated. Run `npm run dev:backend --workspace=@taskflow/web` after updating Convex schema/functions.
- Keep `.env*` files out of git.
