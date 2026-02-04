# Taskflow Docs (Rewrite)

These docs describe the Convex-first rewrite (the new app lives in `apps/web`).

Legacy code still exists for reference:

- `apps/frontend` (legacy Next.js)
- `apps/backend` (legacy Express/Drizzle/Redis/BullMQ)

## Start Here

- Roadmap: `docs/ROADMAP.md`
- Feature index: `docs/FEATURES.md`
- Architecture: `docs/ARCHITECTURE/overview.md`
- UI guidelines: `docs/UI_GUIDELINES.md`
- Key decisions (ADRs): `docs/DECISIONS/`
- Legacy reference inventory: `docs/LEGACY/feature-inventory.md`
- Source docs map: `docs/SOURCES.md`

## UI System (Rewrite)

The rewrite UI (`apps/web`) standardizes on a small set of reusable patterns (page shells, toolbar strips, calm list rows, wide kanban, centered chat reading column). These are codified in `docs/UI_GUIDELINES.md` under “Canonical UI Patterns (apps/web)”.

## Product Definition (v1)

Taskflow is a solo AI-assisted workplace.

Core loop:

1. Capture (Inbox)
2. Organize (Projects / Tasks / Notes)
3. Execute (Schedule)
4. Assist (AI inside the workspace)

Non-goals for v1:

- Team collaboration
- External calendar sync
- Research library + daily digest
- Mention system/backlinks (v1.1)
- Semantic vector search (v1.1)
- Full reminders engine (after schedule model is solid)
