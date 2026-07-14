# Taskflow V3 Product Direction

## Status

Accepted planning direction for the next major version of Taskflow.

This document narrows Taskflow from a collection of peer productivity products into one focused AI project execution workspace. It supersedes the broad product direction in older roadmaps when those documents conflict with this one.

## Confirmed V3 Decisions

- V3 will be built as a parallel application at `apps/web-v3` inside the existing npm/Turbo monorepo.
- TanStack Start will replace Next.js for the V3 frontend.
- Clerk will replace Convex Auth for authentication and user identity.
- V3 will use its own Convex source directory and isolated development deployment while the existing application remains available as a reference.
- V3 will selectively reuse proven product logic, visual assets, UI primitives, and backend behavior instead of reproducing every V2 route and feature.
- The existing `apps/web` application will be removed after V3 is validated and ready for cutover.
- V3 parity means delivering the focused V3 product, not recreating every V2 capability.

## Working Positioning

Taskflow is an **AI project execution workspace** for solo builders, founders, operators, and creators managing multiple active projects without a dedicated project manager.

It turns messy intent and project context into an executable project, keeps the project state current, and makes the next action obvious.

Taskflow is not:

- a general notes app or knowledge base
- a generic todo-list application
- a model playground or general-purpose AI chat client
- a notification center
- a coding agent or browser-based development environment
- a blank-canvas productivity system

## Product Promise

> Capture messy intent. Taskflow turns it into an executable project and keeps it moving.

## The Product Problem

The current application contains several peer products:

- Inbox and capture
- Task management
- Project management
- Rich-text notes
- General AI chat
- Notifications, settings, and onboarding
- Repository research and coding-agent infrastructure

Each area has its own data, UI, navigation, configuration, and product assumptions. Tasks, Notes, and Chat have become deeper products than Projects, even though Projects should be the center of the system.

V3 should not attempt to improve every existing peer product. It should preserve useful capabilities while removing their status as independent destinations.

## Product Thesis

Taskflow should do one thing exceptionally well:

> Turn an unclear goal into a durable, executable project and continuously help the user decide what to do next.

The differentiated outcome is not storing more information. It is reducing the time and thought required to turn information into forward movement.

Taskflow should compete on:

- time from messy input to a useful project
- clarity of project state
- quality of the recommended next action
- visibility of blockers, risks, and open questions
- trust in AI-proposed changes

## Primary Product Surfaces

V3 should have three primary surfaces.

### 1. Command Center

The Command Center answers:

> What needs my attention right now?

It should show:

- recommended next actions
- active and recently changed projects
- blocked or stale projects
- projects missing a next action
- unprocessed captures
- work due soon
- a clear entry point for review

The Command Center is an execution and attention surface, not a dashboard of passive metrics.

### 2. Projects

Projects are the central product entity and the durable representation of an active outcome.

Every project should answer:

- What outcome are we pursuing?
- Why does it matter?
- What phase are we in?
- Is the project healthy, blocked, stale, or progressing?
- What changed recently?
- What is the next action?
- Which decisions and unanswered questions remain?

A project should contain:

- goal or desired outcome
- brief
- status, phase, health, and priority
- target date when relevant
- current milestone
- one explicit next action
- active and completed tasks
- blockers and risks
- open questions
- decisions
- project updates and context
- project-scoped AI operator

The project is not merely a folder containing tasks.

### 3. Capture

Capture is the main entry point into Taskflow's differentiated workflow.

Users should be able to submit:

- a goal or idea
- meeting notes
- a client request
- a project update
- a constraint
- a blocker
- a decision
- a half-written plan

The user should not have to classify the input before submitting it.

The capture flow should be:

```text
Capture messy input
  -> identify intent
  -> ask only necessary questions
  -> generate an editable proposal
  -> user approves
  -> commit project changes
  -> show a plain-language receipt
```

The inbox becomes a temporary queue of unprocessed captures rather than a permanent peer product.

## Core Product Loop

```text
Capture -> Clarify -> Preview -> Approve -> Execute -> Review
```

### Capture

Accept unstructured input without requiring the user to decide whether it is a task, note, project, or update.

### Clarify

Extract the likely project, outcome, tasks, milestones, blockers, risks, questions, and decisions. Ask the minimum number of follow-up questions needed to create a useful proposal.

### Preview

Present proposed changes in a structured, editable form. AI output should not silently become durable project state.

### Approve

Commit only the changes the user approves and show a receipt describing what changed.

### Execute

Help the user act from one clear next action, the current milestone, and a short set of active tasks.

### Review

Identify stale projects, missing next actions, unresolved blockers, recent progress, and plans that need adjustment.

## Product Principles

### Project-first

Projects are the center of gravity. Tasks, milestones, entries, decisions, blockers, and AI interactions exist in service of projects.

### Execution over storage

Store information when it helps the user decide or act. Avoid becoming a second brain, document vault, or configurable database.

### AI as project operator

AI should structure, recommend, update, and review project state. It should not primarily behave as an open-ended chatbot.

### Proposals before mutations

AI-generated changes should be previewed and approved before commit. Every committed change should produce a readable receipt.

### One obvious next action

Every active project should have one explicit next action. A project without one is blocked, stale, or insufficiently defined.

### Opinionated defaults

Taskflow should make good decisions for the user instead of exposing provider selection, tool selection, view configuration, and metadata customization.

### Progressive disclosure

Keep project status and the next action immediately visible. Detailed history, supporting context, and AI execution information should remain available without dominating the primary workflow.

## Information Architecture

Recommended primary navigation:

```text
Command Center
Projects
Review (optional dedicated surface)

[Capture]

Account menu
```

Tasks, Notes, Chat, Notifications, and Code Agent should not remain top-level destinations.

- Tasks appear inside Projects and as derived next-action views in the Command Center.
- Project entries replace the general Notes product.
- AI appears contextually in Capture, Projects, Command Center, and Review.
- Attention items appear directly in the Command Center instead of a notification inbox.
- Account and minimal preferences live in the account menu.

## Domain Direction

### Project

The project aggregate should own or reference:

- goal
- brief
- status
- phase
- health
- priority
- target date
- current milestone
- next action
- tasks
- milestones
- project entries
- blockers
- risks
- open questions
- decisions
- updates

### Task

Tasks should be concrete actions that move a project forward.

The focused task model should prioritize:

- title
- status
- priority
- project
- due or target date
- blocked state
- estimate when useful
- checklist or subtasks
- ordering

Fields such as energy level, streak count, difficulty, arbitrary contexts, templates, embeddings, and invisible AI metadata should be removed unless a validated workflow requires them.

### Project Entry

General notes should become typed project entries:

- update
- decision
- question
- blocker
- risk
- context
- meeting record

Entry types should affect project behavior. A blocker can affect project health, a decision can close a question, and meeting records can produce proposed actions and decisions.

### Capture Proposal

A capture proposal should represent proposed project changes before approval. It may include:

- new project
- project update
- milestone
- task or next action
- blocker or risk
- decision
- open question
- project entry

The proposal and commit receipt are core trust objects, not temporary UI details.

## AI Direction

The user should choose an outcome, not a provider or tool.

Primary AI intents should include:

- Structure this input
- Create a project proposal
- Update this project
- Recommend the next action
- Replan around a constraint
- Summarize current project state
- Identify blockers and open questions
- Review recent progress
- Research a project question

V3 should use:

- one primary inference gateway
- one default model strategy
- one structured-output path
- one research capability with sources
- one explicit context and memory strategy

Provider, reasoning, memory, and tool details should not be normal user decisions.

## Technical Direction

V3 will use a new frontend and authentication foundation while retaining the technologies and implementation work that continue to serve the focused product.

- TanStack Start and TanStack Router
- TanStack Query with the official Convex integration
- React
- Convex with a V3-focused schema and function surface
- Clerk authentication integrated with TanStack Start and Convex
- TypeScript
- Vite
- Tailwind CSS and shadcn UI
- Hugeicons
- Vercel AI SDK
- Zod
- one primary AI provider or gateway

TanStack Start is an intentional early-adopter choice. It is currently in Release Candidate status: its API is considered feature-complete and stable, but bugs or breaking changes may still occur before v1. A focused technical proof must validate the required Taskflow paths before V3 implementation expands.

The framework change should not become a mechanical route-for-route migration. Product refocusing and technical migration should happen together so V3 does not inherit obsolete routes, dependencies, data fields, or framework conventions.

### Parallel Application Strategy

The repository is already an npm/Turbo monorepo. V3 should coexist with the current application during development:

```text
taskflow/
  apps/
    web/       # Existing Next.js and Convex Auth application
    web-v3/    # TanStack Start, Clerk, and V3 Convex application
  packages/
    Taskflow-Context-Compaction/
```

The current `apps/web` application remains a behavioral and visual reference. It should not be modified to host both Next.js and TanStack Start.

`apps/web-v3` should begin with a minimal dependency manifest. Dependencies should be added only when a retained V3 workflow requires them. The existing `apps/web/package.json` should not be copied wholesale.

During development, the two applications should have separate commands, ports, environment files, and Convex deployments. The default development command should not start both frontends and both Convex deployments automatically.

At cutover:

1. Validate V3 against its product and technical acceptance criteria.
2. Retire the existing frontend and legacy Convex deployment.
3. Remove `apps/web`.
4. Rename `apps/web-v3` to `apps/web` if the stable workspace name remains valuable.
5. Update root scripts, deployment configuration, and canonical documentation.

### Convex Strategy

V3 should initially use its own `convex/` directory and development deployment rather than forcing one backend to support both product models and both authentication systems.

This temporary separation is intentional because V3 changes:

- authentication identity
- project semantics
- task scope
- notes and project-entry modeling
- AI proposal and approval behavior
- retained routes and integrations

Relevant Convex queries, mutations, validators, and indexes should be ported selectively. Legacy Notes, Notifications, Daytona, general Chat, and unused task metadata should not be copied merely for compatibility.

Because there is no established user base, V3 should prefer a clean data model over compatibility layers. Any data retained for development or demonstration should use an explicit one-time migration or seed process.

### Authentication Strategy

Clerk owns:

- sign-in and sign-up
- email and social authentication
- GitHub authentication
- sessions and account security
- identity and profile fundamentals

Taskflow owns:

- onboarding state
- product-specific preferences
- projects and project activity
- connected-service metadata required by product workflows

Convex functions must derive the authenticated identity from `ctx.auth`. Client-provided user IDs must never authorize data access, scope AI memory, or select external connected accounts.

GitHub authentication and GitHub repository authorization must remain separate concepts. Signing in with GitHub does not automatically grant every repository scope Taskflow may later need. Explicit scoped connections or Composio connected accounts should be associated with the stable Clerk user identity.

### Reuse Strategy

Prefer selective reuse over wholesale migration.

Good candidates for reuse:

- brand assets and design tokens
- shadcn primitives
- useful shell and inspector patterns
- proven project and task interactions
- focused Convex business logic
- AI structured-output and proposal foundations
- context compaction if V3 conversations require it
- loading, error, and empty-state patterns

Do not automatically port:

- Next.js route and layout structure
- Notes as a peer product
- general AI Chat
- Notifications
- Daytona and Code Agent
- public roadmap
- provider-heavy settings
- unused AI Elements
- redundant research providers
- low-value task metadata and customization

Technical work should prioritize:

1. Prove TanStack Start, Clerk, Convex, live queries, protected routes, mutations, and AI streaming together.
2. Establish passing lint, typecheck, and test commands in `apps/web-v3` from the beginning.
3. Define the focused V3 schema and authenticated ownership model.
4. Build and validate capture-to-project before expanding the workspace.
5. Standardize the AI gateway and proposal protocol.
6. Port only retained product behavior and dependencies.
7. Remove the V2 application after V3 is validated.

## Validation Wedge

The first V3 product proof should be narrower than the full workspace:

> Paste messy intent, answer minimal questions, edit a proposal, and create a useful project.

This vertical slice should include:

- one capture surface
- intent classification
- minimal clarification
- structured project proposal
- editable tasks, milestones, risks, questions, and next action
- explicit approval
- durable project creation
- a readable change receipt

The rest of the redesign should not proceed until this flow demonstrates that the core product promise is useful.

## Success Measures

Primary measures:

- time to first useful project
- percentage of captures that reach an approved proposal
- proposal edit and rejection rates
- percentage of active projects with a next action
- time from project creation to first completed action
- number of stale or blocked projects recovered through review
- AI proposal rollback or correction rate

The primary success target is not chat engagement. It is reliable forward movement on active projects.

## Explicit Non-Goals

V3 should not initially include:

- team collaboration and permissions
- full calendar auto-scheduling
- generic rich-text knowledge management
- standalone general AI chat
- a notification center
- provider and model experimentation UI
- deep customization and custom fields
- coding-agent sandboxes or IDE features
- broad third-party integrations
- complex analytics dashboards

## Product Decision Filter

A capability belongs in focused Taskflow only if it materially improves at least one of these outcomes:

- time from messy input to a useful project
- clarity of current project state
- quality of the recommended next action
- speed of completing that action
- accuracy of identifying blockers or stale work
- trust in AI-proposed changes

If it does not improve one of those outcomes, it should be removed, embedded invisibly, or deferred.

## Recommended Sequence

### Phase 0: Establish the V3 workspace

- Adopt this document as the canonical direction.
- Mark conflicting roadmaps and plans as historical.
- Confirm that Code Agent is archived rather than added to V3.
- Create the isolated `apps/web-v3` workspace.
- Establish separate V3 development commands, environment files, ports, and Convex deployment.

### Phase 1: Prove the technical foundation

- Integrate TanStack Start, Router, Query, Vite, Tailwind, and shadcn.
- Integrate Clerk request middleware, protected routes, loaders, and server functions.
- Configure Convex to validate Clerk identity.
- Prove an authenticated Convex loader, live query, mutation, AI streaming endpoint, and sign-out flow.
- Establish passing lint, typecheck, and test commands.

### Phase 2: Prove capture-to-project

- Define the project proposal contract.
- Build the capture, clarification, preview, approval, and receipt flow in V3.
- Test whether the workflow produces a useful project quickly.

### Phase 3: Establish the project aggregate

- Introduce the focused project, milestone, next-action, entry, blocker, decision, and question semantics.
- Port only the existing logic and data needed by the new model.

### Phase 4: Build the project cockpit

- Make project status, next action, milestone, blockers, and recent changes visible in one surface.
- Embed the project operator within the cockpit.

### Phase 5: Build Command Center and Review

- Derive attention and next-action views from project state.
- Add stale, blocked, and missing-next-action review workflows.

### Phase 6: Validate and cut over

- Validate all retained V3 workflows independently of the legacy app.
- Confirm authentication, authorization, AI approval, error recovery, and deployment behavior.
- Update onboarding and marketing around the focused promise.

### Phase 7: Remove the old product

- Remove `apps/web` and retire its Convex deployment.
- Remove unused root scripts, data paths, dependencies, and documentation.
- Rename `apps/web-v3` if desired and make it the canonical application.
