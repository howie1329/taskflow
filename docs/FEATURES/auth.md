# Auth (Clerk)

## Goal

Users can sign in and Taskflow reliably scopes all data to the signed-in user.

## User Stories

- As a user, I can sign in/out.
- As a user, I can only see my own tasks/notes/projects/inbox/schedule/chat.

## MVP Scope (v1)

- Clerk authentication in the web app
- Convex functions receive and enforce user identity
- Protected routes for the main workspace

## Non-goals (v1)

- Team workspaces
- Role-based access control

## Data Model (Convex)

- No dedicated user table required initially.
- Store `userId` (Clerk subject) on every document.

## UI/UX

- Sign-in flow (Clerk)
- Redirect unauthenticated users to sign-in

## Convex API Surface (to implement)

- Helper to require auth and return `{ userId }`
- Every query/mutation filters by `userId`

## Permissions & Invariants

- Never trust client-provided `userId`.
- Every entity is user-scoped.

## Acceptance Criteria

- Unauthenticated user cannot access workspace routes.
- User A cannot read or mutate User B data.

## Legacy Reference (do not copy blindly)

- Legacy frontend:
  - Clerk provider: `apps/frontend/src/app/layout.js`
  - Uses `useAuth().getToken()` in hooks: `apps/frontend/src/hooks/**`
- Legacy backend:
  - Auth middleware: `apps/backend/middleware/auth.js`
  - v1 routes gated: `apps/backend/routes/v1/index.js`

## Docs Reference

- `apps/frontend/docs/MVP.md`
- `apps/backend/docs/FEATURE_ANALYSIS_AND_RECOMMENDATIONS.md`
