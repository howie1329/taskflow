# AI Architecture (Rewrite)

## Goal

AI helps inside the workplace and can safely operate on user data.

## v1 Approach

- Non-streaming by default.
- AI runs as a Convex action:
  - read relevant user data (optional)
  - call provider
  - persist assistant message

## Tools / Actions

Minimum set:

- create task
- create note
- create project
- link entities
- search entities
- open entity (return routing info)

## Optional: Streaming

If we want token streaming, prefer a single Next.js route handler that streams tokens to the UI and writes the final assistant message (and tool outputs) into Convex.

## Legacy References

- Artifacts system concept: `apps/backend/docs/ARTIFACT_SYSTEM.md`
- Chat history analysis: `apps/backend/docs/CHAT_HISTORY_ANALYSIS.md`
