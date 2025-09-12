Feature Document: Notes + Tasks Hybrid System
Feature Name:
Notion-Style Notes with Task Integration (/todo Blocks)
Summary:
A note-taking system where users can write structured notes using TipTap. Notes support block-based editing (paragraphs, headings, checklists, embeds). Specially, when users create a /todo block inside a note, a real Task is also created in TaskFlow’s task database. This ensures that todos inside notes sync seamlessly with the main task management system.
Goals
Create a Notion-like block editor for notes.
Support inline block commands (/heading, /todo, /quote, etc.).
Ensure /todo blocks are first-class tasks in the task database:
Status (checked/unchecked)
Title
Timestamps (created, completed)
Linked back to the note they were created in.
Provide a hybrid experience where notes and tasks reinforce each other.
User Stories
As a user, I can type /todo in a note and instantly create a linked task.
As a user, I can check off a /todo block in a note and see it completed in my task list.
As a user, I can update a task in my main task list and see the /todo block reflect that change.
As a user, I can see which note a given task came from.
