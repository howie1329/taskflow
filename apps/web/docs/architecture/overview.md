# Architecture Overview

`apps/web` is a Next.js App Router application backed by Convex.

## Main Building Blocks

- **Frontend**: Next.js + React client components
- **Data/API**: Convex queries, mutations, and actions
- **Auth**: Convex Auth integration and user-scoped records
- **AI**: chat route + tool rendering + provider integrations

## High-Level Flow

1. User opens route in `/app/*`.
2. UI calls Convex via `convex/react` hooks.
3. Convex functions resolve data scoped to current authenticated user.
4. UI updates local state and renders feature components.

## Route/Feature Boundaries

- `app/app/*`: page routes and route-level layout composition
- `components/*`: feature modules + reusable UI primitives
- `convex/*`: backend logic and schema for web app data
- `lib/AITools/*`: AI mode prompts, tools, and tool metadata

## Core Feature Areas

- Inbox capture and triage
- Task planning/execution (board + details + creation flows)
- Projects CRUD and detail views
- Notes list/editor with route-driven selection
- AI Chat with thread rail, composer, and tool traces
- Settings and onboarding preferences

## Related Docs

- [Routing](./routing.md)
- [Data model](./data-model.md)
- [AI architecture](./ai.md)
- [Security](./security.md)
