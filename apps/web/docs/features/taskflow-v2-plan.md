# TaskFlow V2 Plan

## Goal

Rebuild TaskFlow into a clearer execution system that helps a user move from capture → plan → act → review with less UI friction, stronger AI reliability, and fewer disconnected flows.

## Product Direction to Lock Before Rewrites

### 1) Core product promise (must be explicit)

Choose one primary promise for V2 and let it drive all tradeoffs:

- **Execution OS**: "Turn goals into daily execution"
- **Personal command center**: "One inbox for tasks, notes, projects, and AI"
- **AI-first operator**: "Plan and execute with AI copiloting every workflow"

If this is not decided first, rewrites will drift and each module will optimize for a different outcome.

### 2) Primary user and job-to-be-done

Decide one default persona for V2 launch (for example: founder/operator, PM, student, or solo creator). Define:

- Top 3 jobs they need weekly
- Most painful current friction points
- What "success in 5 minutes" looks like in first session

### 3) Opinionated scope for V2

Define what V2 is intentionally **not** trying to do yet (for example: team collaboration, external integrations, mobile-first parity). This protects shipping velocity.

---

## What Should Be Rewritten

## A) AI Chat + Agent Stack (UI to inference)

This is the highest-impact rewrite candidate.

### Why rewrite

Current chat is feature-rich but still separate from "actual execution". V2 should make AI outcomes directly mutate user workflows with clear confirmation and trust.

### Rewrite targets

1. **Conversation model**
   - Move from generic thread UI to **intent-driven sessions**:
     - Plan my week
     - Break down project
     - Triage inbox
     - Reflect and adjust
2. **Action protocol**
   - Standardize AI action output into strict action types (create task, edit task, schedule, create project, summarize notes).
   - Add confidence + preview metadata before commit.
3. **Provider abstraction cleanup**
   - Replace ad-hoc provider handling with one minimal inference gateway:
     - model routing
     - retry policy
     - telemetry hooks
     - cost tracking
4. **Memory strategy**
   - Split memory into:
     - session context (short-lived)
     - workspace memory (long-lived preferences/facts)
     - task/project context packs (on-demand)
5. **Tool UI simplification**
   - Keep readable conversation primary.
   - Move raw tool details behind one expandable "execution log" pattern.
6. **Safety and trust UX**
   - Require explicit confirmation for destructive actions.
   - Show plain-language "what changed" receipts after each AI action set.

### V2 acceptance criteria

- 80%+ of AI sessions end with at least one concrete state change in TaskFlow (task/project/note update).
- Every AI change is inspectable and reversible.
- Provider/model switching does not change UI behavior or break action rendering.

---

## B) Information Architecture (Inbox, Tasks, Projects, Notes)

### Why rewrite

Core areas exist, but V2 should reduce overlap and decision fatigue between routes.

### Rewrite targets

1. **Single capture path**
   - One global capture entry that can become task/project/note after quick classification.
2. **Task hierarchy rules**
   - Normalize relationship rules:
     - task ↔ project
     - task ↔ note reference
     - subtask boundaries
3. **Today/Next views**
   - Turn Today into execution-first with clear WIP limits and blocked-state visibility.
4. **Project pages**
   - Promote project page into planning cockpit:
     - objective
     - outcomes
     - milestones
     - linked tasks/notes
5. **Notes integration**
   - Make notes operational:
     - convert note items to tasks
     - attach notes to project decisions
     - AI summarize into action items

### V2 acceptance criteria

- User can capture an item and turn it into an actionable task in <30 seconds.
- Project page answers: "What matters now, what is blocked, what is next?"
- Notes-to-task conversion is first-class, not side workflow.

---

## C) Navigation + Core UI Redesign

### Why rewrite

Current structure is functional, but V2 should emphasize flow state and reduce route switching.

### Rewrite targets

1. **Unified workspace shell**
   - Persistent left nav + central work area + optional right inspector.
2. **Command palette as primary control**
   - Jump, create, and trigger AI intents from one place.
3. **Contextual right panel**
   - Standardize detail/edit/AI assistance as panel patterns (not separate pages where avoidable).
4. **Density controls**
   - Add compact/cozy density presets for lists and boards.
5. **State feedback consistency**
   - Unified loading, empty, error, and success patterns across all features.

### V2 acceptance criteria

- Most common actions (capture, complete, reschedule, ask AI) reachable in ≤2 interactions.
- Reduced context switching between list/detail/AI workflows.

---

## D) Data + Backend Model Rework

### Why rewrite

V2 requires stronger shared primitives to support AI actions and clearer product semantics.

### Rewrite targets

1. **Entity normalization**
   - Audit schema for duplicated fields and implicit states.
   - Add explicit lifecycle states for task/project items.
2. **Event log for user-visible changes**
   - Store structured activity events for undo, audit, and AI receipts.
3. **Derived views strategy**
   - Precompute or cache expensive computed views used in Today, project cockpit, and AI context assembly.
4. **Permission and auth hardening (future-proofing)**
   - Keep user-scoped guarantees strict even before multi-user rollout.

### V2 acceptance criteria

- Any major UI surface can be reconstructed from canonical entities + event log.
- AI-generated mutations use same backend mutation path as manual edits.

---

## E) Onboarding + Personalization Rewrite

### Why rewrite

V2 needs faster time-to-value and better default behavior for AI and planning surfaces.

### Rewrite targets

1. **Outcome-based onboarding**
   - Ask for goals, planning horizon, and workload style.
2. **Guided first-run workflow**
   - Capture 5 items → classify → create first project → generate first week plan.
3. **Adaptive defaults**
   - Set view defaults, AI verbosity, and planning templates from onboarding answers.

### V2 acceptance criteria

- New user reaches first meaningful plan in first session.
- Personalized defaults reduce initial setup friction.

---

## F) Notifications and Review Loop

### Why rewrite

Notifications are placeholder today; V2 should convert notifications into execution feedback loops.

### Rewrite targets

1. **Daily review surface**
   - Missed tasks, overdue projects, AI-generated planning suggestions.
2. **Digest model**
   - In-app digest first; optional email/push later.
3. **Actionable notifications**
   - Every notification should support direct action (complete, snooze, reschedule, open project).

### V2 acceptance criteria

- Notifications drive concrete task updates, not passive reading.
- User has a reliable daily/weekly reflection loop.

---

## Features to Add in V2

1. **Planning modes**
   - Daily plan, weekly plan, and project planning sessions with templates.
2. **AI-generated work plans**
   - Turn project objective into milestone/task proposal with user approval.
3. **Dependency + blocker tracking**
   - Lightweight blockers on tasks/projects.
4. **Review and analytics basics**
   - Completed vs planned, carry-over rate, focus-area distribution.
5. **Undo + change receipts**
   - Especially for AI-created/edited entities.

## Features to Remove or Reduce

1. **Low-signal customization controls** that do not improve execution outcomes.
2. **Duplicate creation flows** that compete with global capture.
3. **Overly technical AI detail surfaces** in default view.
4. **Any dead-end pages** without direct action paths.

---

## Decisions That Need Deeper Product Thinking

1. **AI role boundary**
   - Advisor vs autonomous operator; where is user approval mandatory?
2. **Task granularity model**
   - Should V2 enforce smaller actionable tasks or allow broad task records?
3. **Project taxonomy**
   - Goal, project, milestone, task hierarchy depth.
4. **Scheduling philosophy**
   - Hard calendar commitments vs soft target windows.
5. **Success metrics**
   - What behavioral changes define V2 success beyond engagement?

---

## Suggested Implementation Sequence

## Phase 0 — Product Definition Sprint (1–2 weeks)

- Finalize promise, persona, and V2 scope boundaries.
- Define core workflows and non-goals.
- Approve revised information architecture.

## Phase 1 — Foundations (2–3 weeks)

- Schema/event log adjustments.
- Unified action protocol for AI + manual edits.
- Inference gateway normalization.

## Phase 2 — UX Core Rewrite (3–5 weeks)

- Workspace shell and navigation refresh.
- Global capture and Today execution view rewrite.
- Project cockpit foundation.

## Phase 3 — AI Copilot Rewrite (3–4 weeks)

- Intent sessions, action previews, receipts, execution log UI.
- Memory/context improvements and robust mutation wiring.

## Phase 4 — Onboarding + Review Loop (2–3 weeks)

- Outcome-based onboarding.
- Daily/weekly review and notification actions.

## Phase 5 — Stabilization + Metrics (2 weeks)

- Performance and reliability passes.
- Instrument key product metrics.
- Remove deprecated V1 paths.

---

## V2 Success Metrics (Recommended)

- Time to first actionable plan
- Inbox-to-task conversion rate
- AI session-to-action conversion rate
- Weekly completion reliability (planned vs completed)
- Weekly active planning sessions per user
- Undo/rollback rate after AI actions (trust signal)

## Practical Guardrails for the Rewrite

- Keep one canonical way to do each core action.
- Prefer replacing flows over layering "temporary" alternatives.
- Ship behind feature flags by module where possible.
- Preserve data migration safety before UI migration.
- Do not add complexity without a measurable outcome it improves.
