# Taskflow Web

`apps/web` is the active Taskflow product app.

It is a Next.js App Router application backed by Convex and is the only app in this repo currently in active development.

## Current Scope

Taskflow Web focuses on a personal workflow loop:

1. Capture in inbox
2. Organize with tasks, projects, and notes
3. Execute from the workspace
4. Use AI chat inside the same app

Current app status:

- Inbox, tasks, projects, notes, AI chat, onboarding, and settings are active
- Notifications exist as a placeholder route
- Marketing routes live at `/` and `/roadmap`

## Setup

Install dependencies from the repo root:

```bash
npm install
```

Environment variables live in `apps/web/.env.local`.

Minimum Convex variables:

```bash
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
```

## Development

Run the app:

```bash
npm run dev --workspace=@taskflow/web
```

Or run frontend and Convex separately:

```bash
npm run dev:frontend --workspace=@taskflow/web
npm run dev:backend --workspace=@taskflow/web
```

Useful scripts:

```bash
npm run build --workspace=@taskflow/web
npm run start --workspace=@taskflow/web
npm run lint --workspace=@taskflow/web
```

## Docs

- [`docs/README.md`](./docs/README.md)
- [`docs/architecture/README.md`](./docs/architecture/README.md)
- [`docs/features/README.md`](./docs/features/README.md)
- [`docs/roadmap.md`](./docs/roadmap.md)
- [`docs/ui-guidelines.md`](./docs/ui-guidelines.md)
- [`convex/README.md`](./convex/README.md)
