# Notes

Routes:

- `/app/notes`
- `/app/notes/[noteId]`

## Purpose

Store longer-form context and working documents linked to projects.

## Current Behavior

- Notes sidebar and editor experience
- Create/select/update/delete note
- New note creation opens a code-defined template picker with Blank included
- Notes persist subtle type metadata (`noteType`, optional `templateKey`)
- Note type can be changed later without rewriting title or content
- Pin note and move note across projects
- URL-synced filters:
  - project
  - note type
  - search query
  - view mode (`byProject`, `recent`, `pinned`)
- Autosave state indicator

## Data

- Convex-backed via:
  - `api.notes.listMyNotes`
  - `api.notes.createNote`
  - `api.notes.updateNote`
  - `api.notes.deleteNote`
- Project options from `api.projects.listMyProjects`
- Note templates are code-defined in `components/notes/note-templates.ts`
- Existing notes without type metadata behave as `blank`

## Architecture

- Main state is centralized in `components/notes/notes-provider.tsx`
- Route-driven selected note state from `/app/notes/[noteId]`
- Template selection UI is rendered from `components/notes/create-note-dialog.tsx`
- Type badge and change-type actions live in `components/notes/note-editor.tsx`

## Known Gaps

- Project detail Notes tab is not fully wired to full notes workflows yet.
