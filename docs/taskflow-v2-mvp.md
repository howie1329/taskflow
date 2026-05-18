# Taskflow v2 MVP

## Working Positioning

Taskflow v2 is an **AI project execution workspace**.

It turns messy goals, ideas, and project context into structured projects, clear next actions, and visible momentum.

Taskflow is not a notes app, wiki, generic todo list, or blank-canvas productivity system. It is the execution layer for active projects.

## Product Promise

> Capture messy intent. Taskflow turns it into an executable project and keeps it moving.

## Target User

Initial target: **solo builders, founders, operators, and creators managing multiple active projects without a dedicated project manager.**

They have:

- scattered ideas and obligations
- multiple unfinished projects
- unclear next actions
- project context spread across chats, docs, notes, and memory
- limited patience for configuring a large productivity system

They want:

- fast capture
- AI-assisted structure
- clear project status
- one obvious next action
- lightweight project memory focused on execution

## Market Lessons

### What existing tools do well

- **ClickUp**: broad all-in-one workspace with tasks, docs, dashboards, goals, and AI across workspace data.
- **Asana**: clean project planning, goals, milestones, dependencies, and team workflows.
- **Motion**: strong AI scheduling and daily planning.
- **Notion AI**: flexible workspace, documents, databases, and AI writing/summarization.
- **Linear**: fast, opinionated, high-quality issue/project workflow.
- **Trello**: simple visual task tracking with low setup.
- **Taskade**: lightweight AI collaboration and task generation.

### What existing tools do poorly

- AI is often a sidecar: summarize, rewrite, generate, answer questions.
- Setup burden is high before the system becomes useful.
- Flexible tools can become procrastination systems.
- Project status still requires manual upkeep.
- Many tools are team/enterprise-first instead of solo execution-first.
- AI outputs are often disconnected from durable project state.

### Taskflow's opportunity

Taskflow should beat competitors on **time-to-useful-project**.

A user should be able to paste messy intent and quickly get:

- a project brief
- goals/outcomes
- tasks
- milestones
- blockers/risks
- open questions
- a recommended next action

## Product Principles

1. **Project-first**
   - Projects are the center of gravity.
   - Tasks, decisions, blockers, updates, and AI conversations orbit projects.

2. **Execution over knowledge management**
   - Store only what helps move work forward.
   - Avoid becoming a notes vault or second brain.

3. **AI as project operator, not chatbot**
   - AI should structure, update, summarize, recommend, and mutate project state with user approval.

4. **Opinionated defaults over customization**
   - Avoid blank-canvas setup.
   - The app should guide the user into a useful workflow immediately.

5. **Every project needs a next action**
   - A project without a next action is stale or unclear.

6. **Trust through previews and receipts**
   - AI-generated changes should be previewed before commit.
   - Committed changes should show a plain-language receipt.

## Core Product Loop

```txt
Capture → Clarify → Plan → Execute → Review
```

### 1. Capture

The user enters messy input:

- a goal
- an idea
- meeting notes
- a client request
- project context
- a half-formed plan

### 2. Clarify

Taskflow extracts:

- possible project
- goal
- tasks
- milestones
- risks
- blockers
- open questions
- decisions needed

If important details are missing, AI asks the minimum necessary follow-up questions.

### 3. Plan

Taskflow creates or updates a project workspace:

- project brief
- task list
- milestones
- open questions
- blockers/risks
- next action

### 4. Execute

The user works from:

- command center
- project workspace
- next action recommendation
- project copilot

### 5. Review

Taskflow identifies:

- stale projects
- blocked projects
- missing next actions
- recent progress
- recommended adjustments

## MVP Scope

### Included

#### 1. Command Center

Default home screen answering:

> What needs my attention right now?

Must show:

- active projects
- top next actions
- blocked/stale projects
- quick capture
- AI recommendations

#### 2. Projects

Project list and project detail are the main product surfaces.

A project should include:

- title
- goal
- status
- health
- phase
- priority
- due date optional
- next action
- brief
- tasks
- milestones
- blockers
- open questions
- decisions
- updates
- project copilot

#### 3. Capture

Fast capture input for messy project-related information.

Capture can produce:

- new project proposal
- task proposal
- project update
- blocker
- decision
- open question
- archived item

#### 4. AI Project Structuring

Given messy input, AI proposes a structured project.

The proposal should be editable before creation.

Minimum generated output:

- project title
- goal
- short brief
- milestones
- tasks
- open questions
- risks/blockers
- recommended next action

#### 5. Project Copilot

Each project has a scoped copilot that can read project state and propose updates.

Example prompts:

- “What should I do next?”
- “Summarize where this project stands.”
- “Turn this update into tasks.”
- “What is blocked?”
- “Rewrite the plan based on this new constraint.”

#### 6. Project Entries

Replace generic notes with execution-specific entries:

- update
- decision
- question
- blocker
- risk
- context

These entries are not a general note-taking system. They are project memory for execution.

## Explicit Anti-Goals

Do not include in the MVP:

- full calendar auto-scheduling
- team collaboration and permissions
- complex custom fields
- notification system
- wiki/document editor
- knowledge graph
- generic notes app
- complex automation builder
- enterprise dashboards
- deep external integrations
- model/provider configuration-heavy UI

## Suggested MVP Navigation

```txt
Command Center
Projects
Capture
Assistant
Settings
```

Notes should not be a top-level nav item in v2.

## Data Model Draft

```txt
Project
  title
  goal
  description
  status: active | paused | completed | archived
  health: on_track | needs_attention | blocked | stale
  phase
  priority: low | medium | high
  dueDate?
  nextAction?
  brief
  createdAt
  updatedAt

Task
  projectId
  title
  description?
  status: todo | doing | done
  priority: low | medium | high
  dueDate?
  orderIndex
  createdAt
  updatedAt

Milestone
  projectId
  title
  targetDate?
  status: planned | active | completed
  orderIndex
  createdAt
  updatedAt

ProjectEntry
  projectId
  type: update | decision | question | blocker | risk | context
  title
  content
  status?
  createdAt
  updatedAt

CaptureItem
  content
  status: unprocessed | processed | archived
  suggestedType?
  extractedProjectId?
  createdAt
  updatedAt

Thread
  scope: global | project
  projectId?
  title
  createdAt
  updatedAt
```

## AI Action Model

AI should produce proposed actions, not silently mutate state.

Example action types:

```txt
create_project
update_project
create_task
update_task
create_milestone
create_project_entry
set_next_action
mark_project_health
archive_capture_item
```

Each action should have:

- plain-language summary
- structured payload
- confidence/why-this-action
- preview
- user approval state
- commit receipt

## MVP Success Criteria

Taskflow v2 MVP is successful if:

1. A user can paste messy project intent and create a useful project in under 3 minutes.
2. Every active project has a visible goal, health state, and next action.
3. Project detail answers: “What is this, where does it stand, and what should happen next?”
4. AI output results in inspectable project/task/entry proposals, not just chat text.
5. The app feels faster and more focused than ClickUp/Notion-style setup.
6. The product does not overlap with a knowledge-base or AI notes app.

## Recommended Build Order

### Phase 1: UX Prototype

- new v2 route/app shell
- command center with mock data
- projects list with mock data
- project detail with mock data
- capture screen with mock AI proposal

Goal: validate the product feel before backend complexity.

### Phase 2: Core Persistence

- v2 Convex tables or isolated schema namespace
- project CRUD
- task CRUD
- milestone CRUD
- project entries
- capture items

Goal: make the project workspace real.

### Phase 3: AI Capture-to-Project

- submit messy input
- generate structured proposal
- edit proposal
- approve and create project

Goal: prove the main differentiator.

### Phase 4: Project Copilot

- project-scoped context assembly
- ask project questions
- propose updates/tasks/entries
- commit approved actions

Goal: make AI feel like a project operator.

### Phase 5: Review Loop

- stale project detection
- blocked project surfacing
- missing next action detection
- weekly/project review summaries

Goal: keep projects moving over time.

## North Star

> Every project has a copilot that understands its goal, context, decisions, blockers, and next action.

## Product Mantra

> If it does not move a project forward, it does not belong in Taskflow.
