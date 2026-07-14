# Taskflow Primary Product Surfaces

## Purpose

This document records which existing Taskflow products and capabilities should be kept, reshaped, removed, or deferred for V3.

The goal is not to discard useful engineering. The goal is to stop presenting every useful capability as an independent product with its own navigation, configuration, data model, and mental model.

The canonical V3 direction is defined in [`taskflow-v3-product-direction.md`](./taskflow-v3-product-direction.md).

## Decision Summary

| Current area | Decision | V3 role |
| --- | --- | --- |
| Projects | Keep and substantially reshape | Central product entity and project cockpit |
| Tasks | Keep and simplify | Project actions and derived next-action views |
| Inbox | Reshape | Temporary capture queue |
| Notes | Remove as a peer product | Typed project entries |
| AI Chat | Remove as a peer product | Embedded project operator |
| Onboarding | Reshape | Guided creation of the first useful project |
| Settings | Keep and reduce | Account, security, theme, and essential controls |
| Notifications | Remove for V3 | Attention items in Command Center |
| Research tools | Reduce and embed | Invisible project-operator capability |
| Code Agent and Daytona | Archive | Separate product direction, not a V3 feature |
| Public roadmap | Remove for now | Revisit when external users need it |
| Landing page | Reshape | Market the focused project-execution outcome |

## Keep

### Projects

Projects should become the center of Taskflow.

#### Keep from the current product

- authenticated ownership
- create, edit, archive, and delete behavior
- task relationships
- optional project-scoped conversations
- project selection and basic list infrastructure
- useful shell and inspector patterns

#### Why it stays

The project is the natural durable object for the chosen user and problem. Solo builders and operators do not primarily need another place to store tasks or notes. They need help converting uncertain work into a current plan and maintaining momentum.

#### Required V3 outcome

A project must make the outcome, health, current phase, next action, blockers, decisions, and recent movement understandable without visiting another product area.

### Tasks

Tasks remain necessary, but they should stop functioning as an independent configurable task-management application.

#### Keep

- title
- project relationship
- status
- priority
- due or target date
- blocked state
- estimate when useful
- checklist or subtasks
- ordering
- completion history

#### Simplify or remove

- energy level
- streak count
- difficulty
- template flags
- arbitrary context arrays
- direct task embeddings
- invisible AI metadata without visible behavior
- multiple overlapping date semantics
- broad tag customization
- redundant creation and editing flows

#### V3 role

Tasks are concrete actions that move a project forward. The global view of tasks is a derived next-action or attention view, not a separate product model.

### Basic capture infrastructure

Keep the ability to record unprocessed input quickly and durably.

#### Keep

- fast text capture
- unprocessed item queue
- archive and delete
- capture history
- conversion or association with projects
- source input attached to resulting project changes

#### V3 role

Capture is the entrance to project creation and project updates. The queue exists only for input that has not yet been clarified or approved.

### Authentication and account foundation

Keep:

- sign in and sign up
- user identity
- authenticated data ownership
- account management
- onboarding completion state
- minimal durable preferences

These capabilities support the product but should not consume primary navigation or product attention.

### Relevant AI infrastructure

Keep the engineering that supports the focused operator:

- AI SDK integration
- structured output
- explicit tool definitions
- project and task mutation foundations
- project context assembly
- context compaction where it remains necessary
- traceability needed for proposal receipts and debugging

Do not preserve every existing provider, component, tool, or visualization simply because it already exists.

## Reshape

### Inbox becomes Capture

#### Current problem

The Inbox behaves as a permanent peer destination and requires the user to decide how an item should be converted. That preserves the classification work Taskflow should perform.

#### V3 behavior

```text
User captures input
  -> Taskflow identifies likely intent
  -> Taskflow asks necessary questions
  -> Taskflow proposes project changes
  -> User edits and approves
  -> Taskflow commits changes and shows a receipt
```

#### Resulting classifications

- new project proposal
- update to an existing project
- task or next action
- milestone
- blocker or risk
- decision
- open question
- project context entry

The user should be able to override Taskflow's classification before approval.

### Project list becomes project portfolio

The Projects surface should help the user scan active outcomes rather than browse decorative project cards.

It should emphasize:

- health
- next action
- current phase
- blocked or stale state
- recent progress
- target date when relevant

Project color and icon can remain lightweight identifiers, but they should not carry more product weight than project health or next action.

### Project detail becomes project cockpit

The cockpit should combine four responsibilities.

#### Status

- goal
- brief
- phase
- health
- target date
- latest update
- next review

#### Execution

- one prominent next action
- current milestone
- active tasks
- blockers
- recently completed work

#### Project memory

- decisions
- updates
- open questions
- risks
- context
- meeting records

#### Project operator

- What should I do next?
- Summarize where this stands.
- Turn this update into proposed changes.
- What is blocked or stale?
- Replan around this constraint.
- Prepare this project for review.

The user should not need to move between Tasks, Notes, and Chat to understand one project.

### Task manager becomes next-action system

V3 should distinguish between:

- **Project outcome**: what success looks like
- **Milestone**: a meaningful intermediate result
- **Task**: a concrete unit of work
- **Next action**: the immediate action that can move the project forward

Every active project should have one explicit next action. Other planned tasks can exist, but Taskflow should privilege the next action in the project cockpit and Command Center.

A global execution view may show:

- recommended next actions
- due soon
- blocked
- waiting
- recently completed

It should not recreate a separate, deeply configurable task-management product.

### Notes become project entries

#### Current problem

The current Notes product is a general rich-text workspace with templates, browsing, pinning, AI review, and a dedicated copilot. It competes with the project-execution thesis and creates another location the user must maintain.

#### V3 replacement

Use typed project entries:

- update
- decision
- question
- blocker
- risk
- context
- meeting record

Entries may support focused rich text, but they are not a general knowledge base.

#### Behavioral value

- A blocker can change project health.
- A decision can resolve an open question.
- An update can produce proposed task and milestone changes.
- Meeting records can produce proposed decisions and actions.
- Risks can appear during project review.

Existing notes can be migrated to context entries where appropriate rather than immediately discarded.

### AI Chat becomes embedded project operator

#### Current problem

The current chat exposes model, provider, mode, project scope, research tools, memory, reasoning, and tool detail as user-facing decisions. This makes Taskflow behave like a general AI interface platform.

#### V3 placement

- Capture: structure input and create proposals.
- Project cockpit: answer project questions and propose state changes.
- Command Center: recommend where attention should go.
- Review: identify stale work, blockers, and missing next actions.

#### User-facing intents

- Structure this
- Update the project
- Create a plan
- Recommend the next action
- Review progress
- Research this question
- Replan around a constraint

Taskflow should choose the model and tools needed to fulfill the intent.

#### Trust behavior

AI mutations should use:

```text
Intent -> Proposal -> Preview -> Approval -> Commit -> Receipt
```

An execution log is not a substitute for pre-commit approval.

### Onboarding becomes first useful project

Replace configuration-heavy onboarding with a guided demonstration of the product promise.

Recommended onboarding:

1. Ask what the user is trying to accomplish.
2. Let the user paste everything they currently know.
3. Generate an editable project proposal.
4. Ask only essential clarification questions.
5. Create the project after approval.
6. Present the first next action.

The user should finish onboarding with useful project state, not merely a configured profile.

### Settings becomes minimal account controls

#### Keep

- profile
- account and security
- theme
- data export and deletion
- notification delivery preferences only after delivery features exist

#### Remove or hide

- default AI model selection
- reasoning visibility settings
- tool-detail settings
- task-view defaults
- provider-specific configuration
- settings required only because the product has too many peer surfaces

Strong defaults should replace most product configuration.

### Research becomes an invisible capability

Research should support project work without becoming a set of branded modes.

Useful research outcomes include:

- investigate a blocker
- verify current information
- gather sources for a decision
- answer an open project question

Taskflow should retain one primary research implementation and store the useful conclusion and sources in the project. Provider identity and raw tool payloads should remain secondary implementation details.

### Landing page becomes outcome-led marketing

The landing page should stop presenting Inbox, Tasks, Projects, Notes, Schedule, and AI Chat as six products.

It should market one outcome:

> Turn messy project context into a clear plan and an obvious next action.

The landing narrative should demonstrate:

1. messy capture
2. structured proposal
3. approved project
4. project cockpit
5. next-action and review loop

## Remove for V3

### Notification center

The current product does not have enough external events, collaboration activity, or background automation to justify a standalone notification system.

Important attention items should appear directly in the Command Center:

- stale project
- blocked project
- missing next action
- overdue work
- review due

Email or push reminders can be added later if the review loop proves valuable.

### General Notes product

Remove Notes as a top-level product, including the assumption that Taskflow should be a knowledge base.

Reconsider or remove:

- general note templates
- independent note taxonomy
- pinning and note browsing
- note-specific AI reviewer
- standalone note copilot
- note-centered navigation

Reuse only the editor capabilities required by typed project entries.

### Standalone general AI chat

Remove the general "Ask anything" experience from primary navigation.

An unbounded chat destination naturally pulls Taskflow toward general research, coding, finance, media, model experimentation, and tool visualization. Those capabilities weaken the project-execution boundary.

### Code Agent and Daytona

Archive:

- repository inspection as a peer workflow
- Daytona sandbox lifecycle
- persistent coding sessions
- Codex authentication inside sandboxes
- code-agent thread models
- terminal, file tree, diff, and IDE-style ambitions

This direction is viable only as a deliberate product pivot to a repo-aware operator for developers. It should not be added to the project-execution workspace as another sidebar feature.

### Public roadmap

Remove the public roadmap until Taskflow has a validated product direction and external users who benefit from roadmap visibility.

The current roadmap also advertises breadth that conflicts with the focused product.

### Provider and tool breadth

The focused product should not directly support a large visible matrix of model providers, search vendors, memory providers, rendering systems, and sandbox tools.

Converge on:

- one inference gateway
- one model strategy
- one research capability
- one memory and context strategy
- one structured proposal protocol

Remove dependencies after confirming they are not required by the validated capture-to-project flow.

### Low-value customization

Remove or postpone:

- multiple task density and view options
- default model configuration
- reasoning and tool visibility controls
- broad tag customization
- numerous task metadata fields
- duplicate creation flows
- configuration before the user has experienced the product

## Defer

The following ideas may become useful later but should not be part of the initial V3 scope:

- team collaboration
- external integrations
- calendar auto-scheduling
- recurring work
- custom fields
- email and push delivery
- advanced project analytics
- semantic workspace search
- public API
- coding-agent execution

Deferred work must earn its way back by strengthening the core project-execution loop.

## Recommended Navigation

Preferred minimal structure:

```text
Command Center
Projects

[Capture]

Account menu
```

An optional dedicated Review surface may be added if review becomes a sufficiently deep workflow:

```text
Command Center
Projects
Review

[Capture]

Account menu
```

There should be no top-level Tasks, Notes, Chat, Notifications, or Code Agent destinations.

## Decision Test

For every retained or proposed capability, ask:

1. Does it reduce time from messy input to a useful project?
2. Does it clarify current project state?
3. Does it improve the recommended next action?
4. Does it help complete that action?
5. Does it identify blockers or stale work more accurately?
6. Does it increase trust in AI-proposed changes?

If the answer is no to all six, the capability should be removed, embedded invisibly, or deferred.

## Final Product Boundary

Taskflow V3 is not the sum of the current peer products.

It is one project-execution product supported by:

- capture instead of a permanent inbox workflow
- next actions instead of a standalone task-management universe
- typed project entries instead of a knowledge base
- an embedded project operator instead of general AI chat
- direct attention signals instead of a notification center
- opinionated defaults instead of provider and workflow configuration

That boundary should guide product design, schema decisions, dependency removal, navigation, onboarding, and marketing.
