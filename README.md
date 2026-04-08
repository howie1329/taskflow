# Taskflow

Taskflow is a monorepo for the current web app and shared packages.

## Current Repo Status

- `apps/web`: active product app and the only app in active development
- `apps/frontend`: deprecated legacy app
- `apps/backend`: deprecated legacy backend
- `packages/*`: shared packages used across Taskflow work

## Monorepo Layout

```text
taskflow/
├── apps/
│   ├── web/       # Active Next.js + Convex app
│   ├── frontend/  # Deprecated legacy app
│   └── backend/   # Deprecated legacy backend
├── packages/      # Shared packages
└── docs/          # Repo-level docs index and legacy reference
```

## Start Here

- Repo docs index: [`docs/README.md`](./docs/README.md)
- Active app: [`apps/web/README.md`](./apps/web/README.md)
- Canonical web docs: [`apps/web/docs/README.md`](./apps/web/docs/README.md)

## Development

Install dependencies from the repo root:

```bash
npm install
```

Useful root scripts:

```bash
npm run dev
npm run dev:web
npm run build
npm run build:web
npm run lint
```

## Shared Packages

- [`packages/Taskflow-Rag/README.md`](./packages/Taskflow-Rag/README.md)
- [`packages/Taskflow-Context-Compaction/README.md`](./packages/Taskflow-Context-Compaction/README.md)
- [`packages/Taskflow-Chat-Content/README.md`](./packages/Taskflow-Chat-Content/README.md)

## Documentation Rules

- Treat `apps/web/docs` as the canonical source for current product and implementation docs.
- Treat root `docs/` as repo orientation plus a small legacy reference.
- Do not add new product docs to `apps/frontend` or `apps/backend`.
