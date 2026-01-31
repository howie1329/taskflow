# Attachments (v1.1)

## Goal

Allow attaching files/links to tasks and notes.

## User Stories

- As a user, I can attach a file to a task.
- As a user, I can attach a file to a note.

## Scope (v1.1)

- File upload + storage strategy
- Attachment list UI

## Data Model (Convex)

- `attachments`
  - `userId`
  - `ownerType` ("task" | "note")
  - `ownerId` (Id<...>)
  - `name`, `mimeType`, `size`, `url`
  - `createdAt`

## Convex API Surface (to implement)

- actions/mutations for upload + attach
- queries to list attachments by owner

## Acceptance Criteria

- Attachments persist and can be downloaded/viewed.

## Docs Reference

- `apps/backend/docs/FEATURE_ANALYSIS_AND_RECOMMENDATIONS.md` (Attachments)
