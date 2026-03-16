# Notes

Routes:

- `/app/notes`
- `/app/notes/[noteId]`

## Purpose

Store longer-form context and working documents linked to projects.

## Current Behavior

- Notes list and editor experience
- Create, select, update, delete, pin, and move notes
- New note creation uses a code-defined template picker with Blank included
- Notes persist subtle type metadata with optional template keys
- URL-synced filters:
  - project
  - note type
  - search query
  - view mode (`byProject`, `recent`, `pinned`)
- Autosave state indicator

## UI Shape

- Desktop uses a two-pane notes workspace: list on the left, editor on the right.
- Mobile keeps list browsing primary and opens editing in a sheet/panel flow.
- The default list mode groups notes by project, with recent and pinned views available as alternate slices.

## Data

- Convex-backed via:
  - `api.notes.listMyNotes`
  - `api.notes.createNote`
  - `api.notes.updateNote`
  - `api.notes.deleteNote`
- Project options come from `api.projects.listMyProjects`
- Note templates are code-defined in `components/notes/note-templates.ts`
- Existing notes without type metadata behave as `blank`

## Architecture

- Main state is centralized in `components/notes/notes-provider.tsx`
- Route-driven selected note state comes from `/app/notes/[noteId]`
- Template selection UI is rendered from `components/notes/create-note-dialog.tsx`
- Type badge and change-type actions live in `components/notes/note-editor.tsx`

## Known Gap

- Project detail notes integration is still partial in the current UI.
