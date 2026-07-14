# Taskflow V3 Product Direction

## Status

Proposed product direction for the next major version of Taskflow.

This document narrows Taskflow from a collection of peer productivity products into one focused AI project execution workspace. It supersedes the broad product direction in older roadmaps when those documents conflict with this one.

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

V3 should retain the current core stack:

- Next.js and React
- Convex and the existing authentication foundation
- TypeScript
- Tailwind CSS and shadcn UI
- Vercel AI SDK

The current technical problem is not an obsolete framework. It is product scope, dependency breadth, API drift, and the absence of a reliable verification baseline.

Technical work should prioritize:

1. Establish passing lint, typecheck, and test commands.
2. Add characterization coverage for retained data and AI paths.
3. Introduce V3 project semantics without replacing the platform.
4. Standardize the AI gateway and proposal protocol.
5. Remove unused providers, tools, components, routes, and fields.
6. Migrate retained data deliberately.
7. Remove obsolete V2 paths after the focused flow is proven.

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

### Phase 0: Confirm the product decision

- Adopt this document as the canonical direction.
- Mark conflicting roadmaps and plans as historical.
- Confirm that Code Agent is archived rather than added to V3.

### Phase 1: Prove capture-to-project

- Define the project proposal contract.
- Prototype the capture, clarification, preview, approval, and receipt flow.
- Test whether the workflow produces a useful project quickly.

### Phase 2: Establish the project aggregate

- Introduce the focused project, milestone, next-action, entry, blocker, decision, and question semantics.
- Migrate only the existing data needed by the new model.

### Phase 3: Build the project cockpit

- Make project status, next action, milestone, blockers, and recent changes visible in one surface.
- Embed the project operator within the cockpit.

### Phase 4: Build Command Center and Review

- Derive attention and next-action views from project state.
- Add stale, blocked, and missing-next-action review workflows.

### Phase 5: Subtract the old product

- Remove top-level Tasks, Notes, Chat, Notifications, and Code Agent surfaces.
- Remove unused data fields, routes, dependencies, and AI providers.
- Update marketing and onboarding around the focused promise.

