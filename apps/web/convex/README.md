# Convex Functions for Taskflow Web

This directory powers the Convex backend for `apps/web`.

## Key Modules

- `schema.ts`: Database schema for tasks, projects, tags, inbox items, and profiles.
- `tasks.ts`: Task CRUD, filters, and scheduling behavior.
- `projects.ts`: Project CRUD plus archive and detail fetches.
- `inbox.ts`: Inbox capture and conversion flows.
- `subtasks.ts`: Subtask CRUD and completion toggles.
- `tags.ts`: Tag creation and list helpers.
- `preferences.ts`: User preference updates for onboarding and settings.
- `profiles.ts`: User profile reads and updates.
- `users.ts`: User identity helpers tied to Convex auth.
- `auth.ts` + `auth.config.ts`: Convex Auth configuration (Password provider).

## Development Notes

- Run `npm run dev:backend --workspace=@taskflow/web` to start the Convex dev server.
- Use `npx convex dev` from `apps/web` for CLI tools and type generation.
- Generated types live in `convex/_generated` and should not be edited.
