# Security Model

Security in `apps/web` depends on user-scoped Convex data access.

## Non-Negotiables

- Never trust client-provided user identity.
- Scope every query/mutation/action to the authenticated user.
- Validate ownership before update/delete operations.
- Validate referenced records (project/task/note/thread) belong to the same user.

## Current Pattern

- Convex functions typically resolve identity using `getAuthUserId(ctx)`.
- Reads use user indices (for example `by_user`, `by_user_status`) when possible.
- Direct ID reads are followed by ownership checks before returning or mutating.

## Examples in Code

- `convex/projects.ts`: list by user index + ownership guard on direct record operations.
- `convex/tasks.ts`, `convex/notes.ts`, `convex/chat.ts`: follow the same user-scoped pattern.

## Frontend Expectations

- Frontend should never send explicit `userId` for authorization.
- Frontend may send record IDs, but backend must always verify ownership.
- UI should handle unauthorized/not-found as equivalent where appropriate.

## Operational Guidance

- Prefer adding/reusing user-scoped indices over broad scans.
- Keep error messages informative but avoid exposing internals.
- Treat cross-entity operations as high-risk and verify all linked IDs.
