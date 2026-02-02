# Tasks

## Goal

Tasks are the primary execution unit. Users can create, organize, and complete tasks reliably.

## User Stories

- As a user, I can create a task quickly.
- As a user, I can edit status/priority/due date/tags.
- As a user, I can complete and un-complete tasks.
- As a user, I can view tasks by project and by schedule day.

## MVP Scope (v1)

- Task CRUD
- Fields: title, description (optional), notes (optional), status, priority, dueDate (optional), scheduledDate (optional), tags (tagIds array), projectId (optional)
- Project association (optional)
- Completion toggle
- Inline tag creation from task page

## Non-goals (v1)

- Recurring tasks (v1.1)
- Dependencies and graphs (later)
- Activity log (later)
- Bulk actions (v1.1+)

## Data Model (Convex)

- `tasks`
  - `userId` (Id<"users">) - Reference to auth user
  - `title` (string) - Task title
  - `description` (string | undefined) - Optional description
  - `notes` (string | undefined) - Private notes for the task
  - `status` ("Not Started" | "To Do" | "In Progress" | "Completed")
  - `priority` ("low" | "medium" | "high")
  - `dueDate` (number | undefined) - Timestamp for precise timing
  - `scheduledDate` (string | undefined) - YYYY-MM-DD for day-based planning
  - `completionDate` (number | undefined) - When actually completed
  - `projectId` (Id<"projects"> | undefined) - Many-to-one with projects
  - `tagIds` (Id<"tags">[]) - Many-to-many with tags (array, can be empty)
  - `parentTaskId` (Id<"tasks"> | undefined) - Self-referencing for subtasks
  - `estimatedDuration` (number | undefined) - Minutes
  - `actualDuration` (number | undefined) - Minutes
  - `energyLevel` ("low" | "medium" | "high")
  - `context` (string[]) - @home, @office, @calls, etc.
  - `source` ("inbox" | "created" | "ai-suggested")
  - `orderIndex` (number) - For manual ordering
  - `lastActiveAt` (number) - Activity tracking
  - `streakCount` (number) - Completion streak
  - `difficulty` ("easy" | "medium" | "hard")
  - `isTemplate` (boolean) - Template flag
  - `aiSummary` (string | undefined) - AI-generated summary
  - `aiContext` (any) - Flexible AI analysis data
  - `embedding` (number[] | undefined) - For future semantic search
  - `createdAt` (number)
  - `updatedAt` (number)

Indexes:

- by `userId` (by_user)
- by `userId + status` (by_user_status)
- by `userId + projectId` (by_user_project)
- by `userId + scheduledDate` (by_user_scheduled)
- by `userId + dueDate` (by_user_due)
- by `userId + priority` (by_user_priority)
- by `userId + lastActiveAt` (by_user_active)
- by `userId + parentTaskId` (by_user_parent)
- by `userId + tagIds` (by_user_tags)
- Search index: `search_title` (searches title field only)

## UI/UX

- Board view with filters (status, priority, project, tag, schedule)
- Today+Board view combining today's tasks with regular board
- Task detail sheet with full editing capabilities
- Inline tag creation from filter dropdown
- "Create tag..." option in tag dropdown auto-selects new tag
- Completion toggle with visual feedback
- Search via "/" keyboard shortcut (title-only search)

## Convex API Surface (implemented)

- queries
  - `tasks.listMyTasks({ status?, projectId?, hideCompleted?, scheduledDate? })` - List tasks with optional filters
  - `tasks.getMyTask({ taskId })` - Get single task by ID with ownership check
  - `tasks.searchMyTasks({ query })` - Search tasks by title (uses search_title index)
- mutations
  - `tasks.createTask({ title, description?, notes?, status?, priority?, dueDate?, scheduledDate?, projectId?, tagIds?, estimatedDuration?, energyLevel?, difficulty? })`
  - `tasks.updateTask({ taskId, title?, description?, notes?, status?, priority?, dueDate?, scheduledDate?, projectId?, tagIds?, estimatedDuration?, energyLevel?, difficulty? })` - Supports clearing fields by passing null
  - `tasks.toggleComplete({ taskId })` - Toggle completion status
  - `tasks.updateTaskOrder({ updates: [{ taskId, orderIndex }] })` - Bulk update task ordering
  - `tasks.deleteTask({ taskId })`

## Permissions & Invariants

- Only owner can access tasks.
- `status` and `priority` must be validated against allowed values.
- If `projectId` set, project must belong to the same user.
- If `tagIds` provided, all tags must belong to the same user.
- updateTask supports clearing optional fields by passing null (converted to undefined in DB).

## Acceptance Criteria

- CRUD works and stays consistent across views.
- Tasks can be filtered by status/project/tag/schedule.
- Tags can be created inline from task page and auto-selected.
- Task details can be edited including status, priority, project, tags, dates, and notes.
- Clearing fields (setting to null) actually removes them from the task.

## Known Gaps

- Search is title-only via search_title index. Full-text search across description/notes not yet implemented.

## Legacy Reference (do not copy blindly)

- Legacy frontend:
  - Tasks page: `apps/frontend/src/app/mainview/task/page.js`
  - Task create dialog: `apps/frontend/src/presentation/components/task/CreateTaskDialog.js`
  - Task providers: `apps/frontend/src/presentation/components/task/Providers/`
  - Task hooks: `apps/frontend/src/hooks/tasks/`
- Legacy backend:
  - Routes: `apps/backend/routes/v1/tasks.js`
  - Controllers: `apps/backend/controllers/tasks.js`
  - Ops: `apps/backend/db/operations/tasks.js`

## Docs Reference

- `apps/frontend/docs/MVP.md`
- `apps/backend/docs/FEATURE_ANALYSIS_AND_RECOMMENDATIONS.md`
