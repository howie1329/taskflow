# Search + Command Palette

## Goal

Users can jump to any item and quickly create new items without breaking flow.

## User Stories

- As a user, I can press Cmd/Ctrl+K to open global search.
- As a user, I can search tasks/notes/projects/conversations.
- As a user, I can quick-create a task/note/project from the palette.

## MVP Scope (v1)

- Cmd/Ctrl+K dialog
- Basic search (string match) across core entities
- Quick create actions

## Non-goals (v1)

- Semantic search / embeddings (v1.1+)
- Saved filters (v1.1+)

## Data Model (Convex)

- No new tables required; queries search existing docs.
- Optional: maintain lightweight search indexes later.

## UI/UX

- Command palette with grouped results
- Keyboard navigation and enter-to-open

## Convex API Surface (to implement)

- action/query
  - `search.global({ query })` returns grouped results

## Permissions & Invariants

- Search must always be user-scoped.

## Acceptance Criteria

- Cmd/Ctrl+K works consistently.
- Results are correct and open the right pages.

## Legacy Reference (do not copy blindly)

- Legacy frontend:
  - Command/search modal: `apps/frontend/src/presentation/components/Layout/GlobalSearch.js`
- Legacy backend:
  - Smart search route: `apps/backend/routes/v1/search.js`

## Docs Reference

- `apps/backend/docs/FEATURE_RECOMMENDATIONS_SUMMARY.md` (Command palette)
- `apps/backend/docs/FEATURE_ANALYSIS_AND_RECOMMENDATIONS.md`
