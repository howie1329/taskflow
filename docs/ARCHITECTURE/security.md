# Security (Rewrite)

## Non-Negotiables

- Every document is user-scoped.
- Never accept `userId` from the client.
- Any cross-entity link must be validated to belong to the same user.

## Required Patterns

- Central helper for `requireUser(ctx)`
- Queries:
  - filter by `userId`
  - never return documents from other users
- Mutations:
  - verify ownership before patching/deleting
  - verify referenced IDs belong to the same user

## Legacy Lessons

Legacy search and some CRUD operations had user-scoping gaps. The rewrite must treat this as a hard requirement.

References:

- `apps/backend/docs/FEATURE_ANALYSIS_AND_RECOMMENDATIONS.md` (user-scoped search)
- `apps/frontend/docs/FEATURE_GAPS_AND_IDEAS.md`
