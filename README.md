# Taskflow

Taskflow is an AI-native productivity workspace built as a monorepo.

Today, the active product is **`apps/web`** (Next.js + Convex), supported by reusable internal packages for retrieval-augmented context and chat-content processing.

This README is focused on the active stack and shared packages that power it.

---

## Why Taskflow

Taskflow is designed around a practical loop for modern knowledge work:

1. Capture ideas quickly
2. Organize tasks/projects/notes
3. Execute from a focused workspace
4. Use embedded AI to reason over context and make progress

For recruiters and open-source contributors, this repo demonstrates:

- Product-oriented full-stack engineering in a monorepo
- AI integration patterns in production-style UX
- Reusable package architecture (`packages/*`) shared with the app
- Clear separation between product app code and portable library code

---

## Monorepo Structure (Current Focus)

```text
taskflow/
├── apps/
│   └── web/                              # Active product app (Next.js + Convex)
├── packages/
│   ├── Taskflow-Rag/                     # RAG/context retrieval package
│   ├── Taskflow-Context-Compaction/      # Chat context compaction package
│   └── Taskflow-Chat-Content/            # Chat content utilities package
└── docs/                                 # Repo-level supporting docs
```

> This README intentionally focuses on `apps/web` and `packages/*`.

---

## Active Application: `apps/web`

`apps/web` is a Next.js App Router application with a Convex backend integration, built to support an AI-first productivity workflow.

### Core Product Areas

- Inbox and capture flow
- Tasks, projects, and notes management
- In-app AI chat and assistant workflows
- Onboarding and settings surfaces

### Tech Stack

- **Framework:** Next.js 16, React 19
- **Backend platform:** Convex
- **Language:** TypeScript (in `apps/web`)
- **Styling/UI:** Tailwind CSS 4, shadcn UI, Radix primitives
- **State/UX building blocks:** motion, dnd-kit, cmdk, sonner

---

## Shared Packages

Taskflow’s reusable packages are first-class citizens in this monorepo.

### 1) `@taskflow/rag`

Location: `packages/Taskflow-Rag`

Purpose:

- Retrieval-augmented context handling
- Context retrieval service primitives

Primary dependency base:

- `gpt-tokenizer`

### 2) `@taskflow/context-compaction`

Location: `packages/Taskflow-Context-Compaction`

Purpose:

- Rolling chat summaries
- Thread state compaction
- Model-agnostic generation orchestration

Primary dependency base:

- `ai`
- `gpt-tokenizer`
- `zod`

### 3) `@taskflow/chat-content`

Location: `packages/Taskflow-Chat-Content`

Purpose:

- Chat content validation and normalization
- Token estimation
- Summarization planning helpers

Primary dependency base:

- `gpt-tokenizer`
- `zod`
- peer compatibility with `ai`

---

## Dependency Base (What the Project Uses)

Below is a grouped snapshot of major packages used in the active app and shared libraries.

### AI + Model Integration

- `ai`
- `@ai-sdk/react`
- `@ai-sdk/google`
- `@ai-sdk/groq`
- `@ai-sdk/cerebras`
- `@openrouter/ai-sdk-provider`
- `@takoviz/ai-sdk`
- `tokenlens`

### Retrieval / Research / Agent Tooling

- `@mendable/firecrawl-js`
- `@tavily/core`
- `exa-js`
- `@supermemory/tools`
- `mem0ai`

### Product App Platform

- `next`
- `react`
- `react-dom`
- `convex`
- `@convex-dev/auth`
- `@auth/core`

### UI + Design System

- `tailwindcss`
- `@tailwindcss/postcss`
- `shadcn`
- `@radix-ui/*`
- `@hugeicons/react`
- `@hugeicons/core-free-icons`
- `lucide-react`
- `class-variance-authority`
- `clsx`
- `tailwind-merge`

### Editor / Rich Content / Rendering

- `lexical` + `@lexical/*`
- `streamdown` + `@streamdown/*`
- `shiki`
- `@json-render/*`

### Interaction / Motion / Utilities

- `@dnd-kit/core`
- `@xyflow/react`
- `motion`
- `cmdk`
- `sonner`
- `zod`
- `nanoid`

### Monorepo Tooling

- `turbo`
- `prettier`
- `eslint`
- `eslint-config-next`
- `npm-run-all`

---

## Local Development

### Prerequisites

- Node.js `>=25.0.0`
- npm `>=10`

### Install

```bash
npm install
```

### Run the active app

```bash
npm run dev:web
```

Or run directly via workspace:

```bash
npm run dev --workspace=@taskflow/web
```

### Useful root scripts

```bash
npm run dev
npm run build
npm run lint
npm run test
```

### Useful `apps/web` scripts

```bash
npm run dev:frontend --workspace=@taskflow/web
npm run dev:backend --workspace=@taskflow/web
npm run build --workspace=@taskflow/web
npm run start --workspace=@taskflow/web
npm run lint --workspace=@taskflow/web
```

---

## Environment

Create `apps/web/.env.local` and configure required variables for your Convex environment.

Minimum Convex variables:

```bash
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
```

---

## Documentation

- Repo docs index: [`docs/README.md`](./docs/README.md)
- App docs index: [`apps/web/docs/README.md`](./apps/web/docs/README.md)
- App architecture docs: [`apps/web/docs/architecture/README.md`](./apps/web/docs/architecture/README.md)
- App feature docs: [`apps/web/docs/features/README.md`](./apps/web/docs/features/README.md)

---

## Contribution

Contributions are welcome.

Recommended contribution flow:

1. Create a branch from `main`
2. Make focused changes with clear commit messages
3. Run lint/build checks locally
4. Open a PR with context, scope, and validation details

If you are contributing to app behavior, prioritize updates under `apps/web` and keep shared behavior reusable in `packages/*` when appropriate.

---

## License

Unless otherwise specified in individual package metadata, treat the repository as MIT-licensed (shared packages explicitly declare MIT).
