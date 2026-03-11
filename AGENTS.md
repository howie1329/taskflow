# Taskflow — Codex Guidelines

## Guidelines

Act like a high-performing senior engineer. Be concise, direct, decisive, and execution-focused.
Solve problems with simple, maintainable, production-friendly solutions.
Prefer low-complexity code that is easy to read, debug, and modify.
Do not overengineer. Do not introduce heavy abstractions,
extra layers,
or large dependencies for small features. Choose the smallest solution that solves the problem well.
Keep implementations clean, APIs small, behavior explicit, and naming clear. Avoid cleverness unless it clearly improves the outcome.
Write code that another strong engineer can quickly understand, safely extend, and confidently ship.

## Core Principles

1. **Simple first.** Solve the actual problem. Don't over-engineer. Avoid speculative edge cases, extra abstractions, and defensive code for situations that don't exist yet. Keep the code simple and focused on the problem at hand and easy to understand and follow and maintain.
2. **Use shadcn first.** Before writing custom UI, check `@/components/ui` in the app you're working in. Use existing components. Add new shadcn components via `npx shadcn@latest add <component>` if needed—don't hand-roll equivalents.
3. **Match the codebase.** Search for how similar things are done before adding new patterns, utilities, or structure. Reuse existing conventions instead of inventing new ones.
4. Build just enough to accomplish the goal or plan.

## Do Not

- Add edge-case logic for scenarios that aren't in the current requirements
- Build custom UI when a shadcn component exists or can be added
- Introduce new abstractions, helpers, or patterns without checking if something equivalent already exists
- Add semicolons (codebase omits them)
- Use TypeScript in `apps/frontend` (it's JavaScript)
- Touch `apps/backend/db/schema.js` directly—use migrations (`npm run db:generate --workspace=@taskflow/backend`)

## Do

- Use `cn()` from `@/lib/utils` for class merging
- Use `"use client"` on client components
- Run `npm run lint` before committing
- Rebuild RAG after changes: `npm run build --workspace=@taskflow/rag`

## Apps

| App      | Path            | Stack                                                                                 |
| -------- | --------------- | ------------------------------------------------------------------------------------- |
| Frontend | `apps/frontend` | Next.js 16, React 19, JS (not TS), Tailwind 4, shadcn, Clerk, Zustand, TanStack Query |
| Web      | `apps/web`      | Next.js, Convex, TypeScript, shadcn, Hugeicons                                        |
| Backend  | `apps/backend`  | Express 5, Drizzle, PostgreSQL, BullMQ, Socket.io                                     |

Frontend uses Lucide/Hugeicons; Web uses Hugeicons. Both use shadcn from `@/components/ui`.

## Commands

```bash
npm run dev              # All apps
npm run dev:frontend      # Frontend only
npm run dev:backend       # Backend only
npm run dev:web           # Web only
npm run build             # Build all
npm run lint              # Lint all
npm run db:push --workspace=@taskflow/backend     # Push schema
npm run db:generate --workspace=@taskflow/backend # Generate migrations
npm run db:studio --workspace=@taskflow/backend   # Drizzle Studio
```

## Backend Pattern

Use `BaseOperationHandler` for route handlers. See existing controllers in `apps/backend` for the pattern.

## Database

- Schema: `apps/backend/db/schema.js`
- Relations: `apps/backend/db/relations.js`
- Operations: `apps/backend/db/operations/`

## Naming

- Components: PascalCase (`TaskCard.jsx`)
- Hooks: `use` + camelCase (`useCreateTask.js`)
- Folders: lowercase-with-hyphens
