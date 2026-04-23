# Codebase Breakdown — Taskflow

> **Scope**: Everything in the monorepo. Primary focus: `apps/web`.
> **Purpose**: Understand what the product does, how it's built, and whether the implementation maps to stated goals.

---

## What Taskflow Is Supposed to Do

The README and docs are consistent and clear:

**Core loop** — Capture → Organize → Execute → AI Assist

1. **Capture** ideas quickly (Inbox)
2. **Organize** into tasks, projects, and notes
3. **Execute** from a focused workspace
4. **Use embedded AI** to reason over context and make progress

**Target audience**: Individual knowledge workers who want an AI-first productivity workspace. The repo also doubles as a demonstration of product-oriented full-stack engineering for recruiters and OSS contributors.

**Stated non-goals (implicit)**: No collaboration features in v1. No mobile-native. No self-hosting angle described.

---

## Features Implemented

| Feature | Route | Status | Notes |
|---------|-------|--------|-------|
| **Inbox** | `/app/inbox` | ✅ Live | Capture, archive, convert to task/project/note, search/filter |
| **Tasks** | `/app/tasks` | ✅ Live | Board + Today+Board + list view, subtasks, tags, filters, task details sheet |
| **Projects** | `/app/projects` | ✅ Live | CRUD with color/icon, active/archived tabs, detail view with task board |
| **Notes** | `/app/notes` | ✅ Live | Lexical editor, templates, project association, pin, URL-synced filters |
| **AI Chat** | `/app/chat` | ✅ Live | Thread rail, model/mode selection, project scope, tool traces, reasoning UI |
| **Settings** | `/app/settings` | ✅ Live | Profile, preferences, AI model defaults |
| **Onboarding** | `/app/onboarding` | ✅ Live | Wizard flow, preference setup, completion tracking |
| **Notifications** | `/app/notifications` | 🚧 Placeholder | Route with empty state, no persisted feed yet |
| **Landing page** | `/` | ✅ Live | Hero, workflow, feature panels |

### Alignment to stated goals

**Capture** → Inbox: Fully implemented. Can capture, archive, and convert items. No email/Slack/calendar ingestion yet, but the capture surface works.

**Organize** → Tasks + Projects + Notes: Fully implemented. Tasks have rich metadata (priority, dates, subtasks, tags). Projects group tasks. Notes are full Lexical documents. The three-way model is coherent.

**Execute** → Task board (Kanban) + Today view: Implemented. The board is functional, filters work, subtasks are nested. No calendar view or deep scheduling UI yet (roadmap mentions this).

**AI Assist** → Chat: Fully implemented with thread history, multi-model support, tool execution, reasoning traces. The AI has workspace context (project scope, thread history). Strong implementation.

**Personalization** → Settings + Onboarding: Implemented. User preferences feed into AI defaults and UI behavior.

**Missing from stated roadmap**:
- No search across all surfaces (roadmap calls this out)
- No command palette or quick nav (cmdk is installed but not surfaced as quick-open)
- Notifications still a placeholder
- Project → Notes integration incomplete (wiring notes tab on project detail)

---

## Tech Stack

### Frontend
| | |
|--|--|
| **Framework** | Next.js 16.2.2, React 19, App Router |
| **Styling** | Tailwind CSS 4.2.2, shadcn/ui, Radix primitives |
| **Icons** | Hugeicons + Lucide |
| **Animation** | Motion |
| **Editor** | Lexical (rich text) + Streamdown (Markdown rendering) |

### Backend
| | |
|--|--|
| **Platform** | Convex 1.34.1 (serverless, real-time) |
| **Auth** | Convex Auth (Password provider) |
| **Database** | Convex (15+ tables, user-scoped, indexed) |

### AI Integration
| | |
|--|--|
| **SDK** | Vercel AI SDK (`ai` v6) |
| **Providers** | OpenRouter, Groq, Cerebras, Google AI |
| **Web research** | Firecrawl, Tavily, Exa |
| **Memory** | SuperMemory, Mem0 |
| **Context management** | `@taskflow/context-compaction` package |

### Interaction / UX
| | |
|--|--|
| **Drag & Drop** | dnd-kit |
| **Flow diagrams** | xyflow (React Flow) |
| **Command palette** | cmdk |
| **Toasts** | Sonner |
| **JSON rendering** | `@json-render/*` |
| **Rive animations** | Rive (webGL2) |

### Monorepo
| | |
|--|--|
| **Tooling** | npm workspaces + Turbo |
| **Linting** | ESLint + Prettier |
| **Language** | TypeScript 5 (strict) |

---

## Architecture Patterns

### Frontend
- **Next.js App Router** with route groups: `(auth)` for sign-in/up, `(protected)` implicit via middleware
- **Server components by default**, `"use client"` only where interaction needed
- **Route-level providers** own client state (e.g. `ChatProvider`)
- **Two-pane layouts** for notes/projects (list + detail)
- **Parallel routes** (`@right`) for inspector/detail panels
- **Feature module pattern**: each feature has `provider.tsx`, `toolbar.tsx`, `content.tsx`, and detail `Sheet` components

### Backend (Convex)
- **Queries** for reads (user-scoped via `getAuthUserId`)
- **Mutations** for writes with ownership checks
- **Actions** for external API calls
- **15 tables**: users, userProfiles, userPreferences, projects, tasks, subtasks, tags, notes, inboxItems, thread, threadMessages, notifications, availableModels, chatUsageTotals, chatUsageDaily

### Security
- Middleware enforces auth on all `/app/*` routes
- Every Convex query/mutation reads `getAuthUserId` server-side
- No client-supplied userId trusted for data access
- Ownership checks on every update/delete

### AI Pipeline (`/api/chat`)
1. Token auth → model selection → message normalization
2. Thread history loaded from Convex
3. Context compaction via `@taskflow/context-compaction`
4. Mode-based tool selection → system prompt with project context
5. `createUIMessageStream` → JSON render piping → streaming response

---

## Shared Package

`packages/Taskflow-Context-Compaction` — Handles long conversation context management:
- Rolling summaries of older messages
- Structured thread state
- Model-agnostic generation orchestration

Used by the chat API to keep long threads within model context limits.

---

## Does the Codebase Align to Its Goals?

### ✅ What aligns well

- **Cohesive product loop**: Capture (Inbox) → Organize (Tasks/Projects/Notes) → Execute (workspace) → AI Assist (Chat) is a clean, well-structured arc
- **Real data layer**: Everything is backed by Convex with proper user scoping — not mock data or stubbed APIs
- **AI-first positioning is real**: Multi-model support, tool execution traces, workspace context, memory integrations — not just a chatbot tacked on
- **Good separation of concerns**: Feature UI ↔ shadcn primitives ↔ Convex schema ↔ AI tools are distinct layers
- **Strong auth story**: Convex Auth with middleware protection and user-scoped data is solid
- **Shared package is properly isolated**: Context compaction lives in a separate package with its own concerns

### ⚠️ Gaps and misalignments

| Gap | Impact |
|-----|--------|
| **No global search** | The Organize step has no cross-surface search. Hard to find things across tasks, projects, notes. Roadmap acknowledges this. |
| **Notifications is a stub** | Personalization → Notifications loop is incomplete. User won't get feedback on in-app events. |
| **Project → Notes not wired** | The roadmap lists this as near-term. Projects can have notes but the integration is incomplete. |
| **cmdk installed but not surfaced as command palette** | Quick navigation would close the loop between Organize and Execute. Currently unused. |
| **No calendar/scheduling UI** | Task scheduling exists (due dates, start dates) but there's no calendar view to visualize it. Roadmap lists this in backlog. |
| **Landing page is static** | The marketing surface is a static page — no waitlist, no auth from the landing page to app flow visible. |

### 🔍 Observations

- **The codebase is well-structured for its size**. File organization is logical, naming conventions are consistent, and the feature module pattern is repeatable.
- **AI tools are comprehensive but the UI is the bottleneck**. Firecrawl, Tavily, Exa, SuperMemory, Mem0 are all wired up — the current chat UI only surfaces a subset through the mode system.
- **The design system doc (`docs/desgin-system/updated-design-system.md`) is thorough but appears disconnected from the current codebase**. It describes a semantic token system that isn't reflected in `apps/web/globals.css` or the shadcn theme. The codebase still uses a mix of direct color values and shadcn defaults. This is a known gap per the doc ("no intention to change global or shared theme colors").
- **952 commits on a relatively contained codebase** suggests active iteration. The feature docs are well-maintained alongside the code.

---

## Summary

| Dimension | Assessment |
|-----------|------------|
| **Product fit to stated goals** | Strong. All four steps of the capture→organize→execute→assist loop are implemented. |
| **Tech choices** | Appropriate. Next.js + Convex is a clean, serverless combo. AI SDK is well-chosen. |
| **Code quality** | Good structure, consistent patterns, proper auth. Some unused packages (cmdk, xyflow) hint at planned features not yet built. |
| **Documentation** | Excellent. Architecture docs, feature docs, and feature status are all up to date. |
| **Gap between docs and reality** | Low. What the docs say matches what's in the code. |
| **Biggest missing pieces** | Global search, command palette, notification feed, calendar view |
| **Overall** | A well-architected, coherent personal productivity app with a genuinely AI-first design. The foundation is solid; the remaining gaps are well-identified in the roadmap. |

---

## Related Docs

- Feature docs: [`apps/web/docs/features/README.md`](../apps/web/docs/features/README.md)
- Architecture: [`apps/web/docs/architecture/README.md`](../apps/web/docs/architecture/README.md)
- Feature status: [`apps/web/docs/features/status.md`](../apps/web/docs/features/status.md)
- Roadmap: [`apps/web/docs/roadmap.md`](../apps/web/docs/roadmap.md)
- Sources map: [`SOURCES.md`](./SOURCES.md)