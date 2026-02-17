# Notes

Routes:

- `/app/notes`
- `/app/notes/[noteId]`

## Purpose

Store longer-form context and working documents linked to projects.

## Current Behavior

- Notes sidebar and editor experience
- Create/select/update/delete note
- Pin note and move note across projects
- URL-synced filters:
  - project
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

## Architecture

- Main state is centralized in `components/notes/notes-provider.tsx`
- Route-driven selected note state from `/app/notes/[noteId]`

## Known Gaps

- Project detail Notes tab is not fully wired to full notes workflows yet.
