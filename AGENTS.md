# Agent Coding Guidelines for Taskflow

## Build/Test/Lint Commands

```bash
# Root-level commands (run from /Users/howardthomas/Desktop/taskflow)
npm run dev              # Start all apps in development mode
npm run dev:frontend     # Start only frontend (Next.js + Turbopack)
npm run dev:backend      # Start only backend (Express + nodemon)
npm run dev:web          # Start web app (Next.js + Convex)
npm run build            # Build all apps and packages
npm run build:frontend   # Build only frontend
npm run build:backend    # Build only backend
npm run build:web        # Build only web
npm run lint             # Run linting across all workspaces
npm run test             # Run tests across all workspaces

# Backend-specific commands
npm run db:push --workspace=@taskflow/backend      # Push schema to database
npm run db:generate --workspace=@taskflow/backend  # Generate migrations
npm run db:studio --workspace=@taskflow/backend    # Open Drizzle Studio
npm run start:backend    # Start backend in production mode

# Package commands
npm run build --workspace=@taskflow/rag            # Build RAG package

# Running a single test (when tests are added)
# Use workspace filter: npm test --workspace=@taskflow/backend -- --grep "test name"
```

## Code Style Guidelines

### General

- **Package manager**: npm (v10.8.2)
- **Node.js**: >=25.0.0
- **Monorepo**: Turbo + npm workspaces
- **No semicolons**: Codebase omits semicolons

### Frontend (apps/frontend)

- **Framework**: Next.js 16 with App Router, React 19
- **Language**: JavaScript (JSX), NOT TypeScript
- **Styling**: Tailwind CSS 4 with CSS variables
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **State**: Zustand + TanStack React Query
- **Auth**: Clerk
- **Font**: JetBrains Mono (primary), Geist Mono

**Naming conventions:**

- Components: PascalCase (e.g., `Button.jsx`, `TaskCard.jsx`)
- Hooks: camelCase starting with "use" (e.g., `useCreateTask.js`)
- Utilities: camelCase (e.g., `utils.js`, `axiosClient.js`)
- Folders: lowercase with hyphens (e.g., `use-mobile.js`)

**File structure:**

```
src/
  app/              # Next.js App Router pages
  components/       # UI components (shadcn/ui)
  hooks/            # Custom React Query hooks
  lib/              # Utilities and clients
  presentation/     # Theme providers, styles
```

**Import order:**

1. React/Next imports
2. Third-party libraries
3. Internal utilities (`@/lib/*`, `@/components/*`)
4. Relative imports

### Backend (apps/backend)

- **Runtime**: Node.js with Express.js 5
- **Language**: ES modules (type: "module"), JavaScript
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Clerk Express middleware
- **Real-time**: Socket.io
- **Jobs**: BullMQ with Redis
- **AI**: Vercel AI SDK

**Naming conventions:**

- Controllers: camelCase exports (e.g., `createTask`, `fetchTasks`)
- Services: camelCase with "Service" suffix (e.g., `taskService`, `cacheService`)
- Files: PascalCase for utilities, camelCase for routes

**Error handling pattern:**

```javascript
export const fetchSingleTask = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const task = await taskService.fetchSingleTask(taskId, userId);
    if (!task) {
      const error = new Error("Task not found");
      error.statusCode = 404;
      throw error;
    }
    return task;
  });
};
```

### Packages (packages/Taskflow-Rag)

- **Language**: TypeScript (strict mode)
- **Module**: ES modules with NodeNext resolution
- **Target**: ES2022

### Database (Drizzle ORM)

- Schema defined in `apps/backend/db/schema.js`
- Relations in `apps/backend/db/relations.js`
- Operations in `apps/backend/db/operations/`

## Key Patterns

### React Components

- Use shadcn/ui components with `class-variance-authority` (cva)
- Use `cn()` utility from `@/lib/utils` for class merging
- Components use `Slot` from Radix for composition
- Always include `"use client"` directive for client components

### React Query Hooks

- Organize by feature in `src/hooks/{feature}/`
- Use optimistic updates with `onMutate`, `onSuccess`, `onError`
- Use `toast` from sonner for user feedback
- Pattern: `use{Action}{Entity}` (e.g., `useCreateTask`)

### API Calls

- Use axios client from `@/lib/axios/axiosClient`
- Get Clerk token with `useAuth().getToken()`
- Always include `withCredentials: true`

### Environment Variables

- Frontend: `NEXT_PUBLIC_*` for client-side, regular for server
- Backend: Standard `process.env.*`

## Lint/Format

- **ESLint**: Next.js core-web-vitals + typescript configs
- **Prettier**: v3.x (installed, no custom config found)
- Always run `npm run lint` before committing

## Important Notes

- Backend has NO test framework configured yet
- Backend build step is a no-op ("echo 'Backend has no build step'")
- RAG package must be rebuilt after changes: `npm run build --workspace=@taskflow/rag`
- Frontend uses Tailwind CSS 4 (different config from v3)
- Web app uses Convex for backend (different from Express backend)
