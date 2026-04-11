# App shell and layout PRD

## Problem Statement

Taskflow’s signed-in experience is built around `AppShell` (`components/app/app-shell.tsx`): a primary sidebar, a central work area, and—on Chat and Notes routes—a right-hand inspector fed by the `@right` parallel route. The architecture is strong (auth gate, overflow discipline, parallel inspector URLs), but several behaviors reduce clarity and comfort for daily use.

Users must infer **when the inspector exists**, **how to return to thread or note lists** without a conventional navigation click, and **how wide each column is allowed to be**. Mobile and desktop chrome differ between Chat and other routes. Power users lack **resize persistence** and **keyboard-first** flows for the two side regions. New users face a **three-band mental model** (primary rail, main, dossier) without always seeing affordances that explain it.

This PRD defines a cohesive upgrade to the workspace layout so navigation, context panels, and focus states feel intentional, consistent, and learnable—without rewriting routing or abandoning the parallel `@right` model.

## Goals

1. **Orientation:** Users always understand which region is active (navigation, work, context) and how to move between them on keyboard, pointer, and touch.
2. **Consistency:** Top-level chrome (titles, primary actions, inspector access) follows one pattern across Chat, Notes, Tasks, Projects, Inbox, and Settings where applicable.
3. **Control:** Users can adjust primary and inspector widths within safe bounds, with optional persistence per device class.
4. **Discoverability:** Inspector and contextual sidebars expose clear entry points when they have content; empty states explain what will appear there.
5. **Accessibility:** Focus order, labels, and shortcuts for opening, closing, and resizing panels meet WCAG-oriented expectations for keyboard and screen-reader users.

## Non-goals

- Replacing Next.js App Router or removing the `@right` parallel route for Chat and Notes.
- Redesigning feature-specific content inside Tasks, Projects, or the AI chat transcript (except where layout chrome touches them).
- Building a full IDE-style multi-pane system (terminals, file trees) in this initiative.
- Changing authentication or onboarding business rules beyond layout surfaces.

## Current state (summary)

- **Root layout:** Theme, fonts, Convex, toasts (`app/layout.tsx`).
- **App layout:** Server auth check; passes `children` + `right` into `AppShell` (`app/app/layout.tsx`).
- **AppShell:** `SidebarProvider` with `primary` and `inspector` scopes; left rail swaps between workspace nav, `ChatSidebar`, and `NotesAppSidebar`; right inspector is offcanvas with route-dependent width; onboarding gate redirects incomplete users.
- **Chat / Notes:** Extra client layouts (`chat/layout.tsx`, `notes` + `NotesShell`) handle mobile headers and list/detail behavior.

## User problems (evidence-based)

| Problem | Impact |
|--------|--------|
| Inspector defaults closed; entry points differ by breakpoint | Users miss dossier/context content on desktop. |
| Re-clicking “AI Chat” / “Notes” toggles list mode instead of navigating | Efficient for power users, opaque for new users. |
| Fixed sidebar widths | Cramped on small laptops; wasted space on ultrawide. |
| Mixed mobile chrome (generic sticky bar vs Chat-specific header) | App feels like multiple products, not one shell. |
| Three vertical bands without a unified label system | Higher cognitive load when Chat + inspector are both relevant. |

## Proposed solution (phased)

### Phase 1 — Shell clarity and consistency

- Define a **small set of layout modes** documented in UI copy: e.g. “Workspace” (primary nav visible), “Context list” (Chat threads or Notes list in the primary column), “Focus” (optional future: hide rails).
- Add **explicit controls** to switch between workspace nav and Chat/Notes list modes (in addition to re-clicking nav items), with tooltips for first-time education.
- Unify **page header patterns** where possible: title row, optional subtitle, slot for route actions, consistent inspector button placement.
- **Inspector affordance:** When `@right` has meaningful content for the current URL, show a persistent control (e.g. “Dossier” / “Inspector” button or icon) in the shared header; when empty, show a muted state or hide per route rules.
- Align **mobile** sticky regions: one spec for title height, safe-area padding, and action placement across Chat and non-chat routes.

### Phase 2 — Resizable and persistent layout

- Introduce **resizable split** between `SidebarInset` main column and the inspector (and optionally primary sidebar width) using bounded min/max widths.
- Persist widths with **`localStorage` or equivalent** (respect reduced-motion and privacy: no server sync required in v1).
- Ensure **keyboard** resize or collapse: document shortcuts; pair with `SidebarTrigger` behavior.

### Phase 3 — Polish and performance

- Loading states use **skeletons** that mirror the three-column shell (`components/route-ui/` alignment).
- Audit **focus traps** when inspector opens as offcanvas on mobile.
- Optional: **remember inspector open/closed** per route family (chat vs notes) with sensible defaults.

## User stories

1. As a new user, I want the app to explain what the right panel is for on Chat and Notes, so I am not surprised when it is empty or full.
2. As a user, I want a visible way to open the inspector when it has content, so I do not have to discover the control by accident.
3. As a user, I want to switch between global navigation and Chat threads (or Notes) with an obvious control, so I do not rely only on repeating the same sidebar link.
4. As a Chat user, I want the top bar to behave like the rest of the app on mobile, so I do not relearn patterns per feature.
5. As a power user, I want to resize the main column and inspector, so I can read long threads and side context comfortably.
6. As a returning user, I want my panel widths remembered, so I do not resize every session.
7. As a keyboard user, I want shortcuts to toggle primary sidebar and inspector, so I can work without the mouse.
8. As a screen-reader user, I want regions labeled (navigation, main, complementary), so I can move predictably through the shell.

## Success metrics

- **Activation:** Increased rate of inspector opens on Chat/Notes sessions where dossier content is available (instrumented event).
- **Efficiency:** Reduction in repeated navigations that only exist to “find” the thread list (proxy: fewer duplicate `/app/chat` loads in a session).
- **Satisfaction:** Task-completion surveys or in-app feedback on “layout is easy to understand” (baseline vs after Phase 1).
- **Technical:** No regression in LCP for `/app/tasks` and `/app/chat`; sidebar resize does not cause layout thrash on low-end devices.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| F1 | Shared header component or spec for app routes (title, actions, inspector entry) | P0 |
| F2 | Explicit control + tooltip for Chat/Notes “back to list” vs “workspace nav” modes | P0 |
| F3 | Inspector entry visible when route has dossier content; empty-state copy when not | P0 |
| F4 | Resizable primary and/or inspector widths with min/max | P1 |
| F5 | Persisted panel widths (local only) | P1 |
| F6 | Documented keyboard shortcuts for sidebar and inspector | P1 |
| F7 | Region semantics (`nav`, `main`, `complementary`) and focus order audit | P1 |
| F8 | Loading skeletons aligned to shell columns | P2 |

## Design and engineering notes

- **Components:** Prefer extending `components/ui/sidebar` and existing shadcn primitives; avoid one-off layout systems.
- **Motion:** Respect `prefers-reduced-motion`; inspector animations already use `useReducedMotion` in `InspectorPanelContent`—keep parity for new transitions.
- **Breakpoints:** `md:` behavior for Notes list/detail (`NotesShell`) must remain coherent with any header unification.
- **Parallel routes:** Keep `@right` as the source of inspector content; resizing is a presentation concern around the same slots.

## Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Resize handles clutter touch UI | Show drag affordance on desktop; keep touch as swipe/offcanvas only on narrow breakpoints. |
| Persisted widths break small windows | Clamp on load; reset if viewport smaller than min sum of panels. |
| Header unification breaks Chat-specific actions | Use a flexible action slot; Chat keeps composer-adjacent actions in main, not header, if that is today’s pattern. |

## Out of scope (this PRD)

- New features in dossier/inspector content (only how it is opened and sized).
- Changing AI Chat or Notes data models.
- Full redesign of marketing or auth pages.
- Third-party window-tiling or multi-window support.

## Open questions

1. Should inspector open automatically on first visit to a thread/note detail, or only on explicit user action?
2. Should primary sidebar width be user-resizable, or only the inspector?
3. Do we standardize on one mobile header component for all `/app/*` routes in Phase 1, or only Chat + default shell?

## Tracking (header-first workspace shell)

- **Route hop order** (single source: `WORKSPACE_ROUTE_CYCLE_HREFS` in `apps/web/lib/workspace-nav.ts`): `/app/inbox` → `/app/tasks` → `/app/notifications` → `/app/projects` → `/app/chat` → `/app/notes` → `/app/settings` (wraps).
- **Route hop shortcut:** **⌥⌘→** next route, **⌥⌘←** previous (Windows: **Ctrl+Alt+→** / **←**). Ignored when focus is in an input, textarea, select, or contenteditable. Does not replace **⌘K** (command palette) or **⌘B** / **⌘I** (primary / inspector toggles from `SidebarProvider`).
- **Shell implementation:** `WorkspaceHeaderStrip`, `FloatingWorkspacePanel`, and refactored `AppShell` in `apps/web/components/app/`.
- **GitHub issue (optional):** Add the issue URL here after filing with [header-workspace-shell-prd-github-issue.md](./header-workspace-shell-prd-github-issue.md).

## References

- Next.js App Router — [Parallel Routes](https://nextjs.org/docs/app/building-your-application/routing/parallel-routes)
- Existing shell implementation: `apps/web/components/app/app-shell.tsx`
- App layout and `@right` slot: `apps/web/app/app/layout.tsx`
- Related UI docs: `apps/web/docs/ui-guidelines.md`, `apps/web/docs/architecture/routing.md`
