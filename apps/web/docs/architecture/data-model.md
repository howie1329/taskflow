# Convex Data Model

The Taskflow web app is backed by Convex. The schema is defined in `convex/schema.ts` and includes auth tables plus Taskflow-specific entities.

## Core Entities

### User Profiles
- **Table**: `userProfiles`
- **Purpose**: Display identity info for the current user.
- **Key fields**: `userId`, `firstName`, `lastName`, `email`.

### User Preferences
- **Table**: `userPreferences`
- **Purpose**: Stores onboarding state and UX preferences.
- **Key fields**: `defaultAIModel`, `onboardingCompletedAt`, `taskDefaultView`, `hideCompletedTasks`, `notificationsEnabled`, `aiChatShowActions`, `aiChatShowToolDetails`, `aiChatShowReasoning`.

### Notifications
- **Table**: `notifications`
- **Purpose**: Stores in-app notification records.
- **Key fields**: `type`, `title`, `body`, `status`, `priority`, `data`, `createdAt`, `readAt`.

### Projects
- **Table**: `projects`
- **Purpose**: Group tasks and notes.
- **Key fields**: `title`, `description`, `status`, `color`, `icon`, `createdAt`, `updatedAt`.

### Tags
- **Table**: `tags`
- **Purpose**: Label tasks for filtering.
- **Key fields**: `name`, `color`, `usageCount`, `createdAt`.

### Tasks
- **Table**: `tasks`
- **Purpose**: Main work items with scheduling, status, and AI metadata.
- **Key fields**: `title`, `description`, `notes`, `status`, `priority`, `scheduledDate`, `dueDate`, `projectId`, `tagIds`, `parentTaskId`, `estimatedDuration`, `actualDuration`, `energyLevel`, `source`, `orderIndex`, `aiSummary`, `aiContext`, `embedding`, `createdAt`, `updatedAt`.
- **Indices**: per-user queries, scheduled/due views, search index on title.

### Subtasks
- **Table**: `subtasks`
- **Purpose**: Checklist items nested under tasks.
- **Key fields**: `taskId`, `title`, `isComplete`, `orderIndex`.

### Notes
- **Table**: `notes`
- **Purpose**: Rich text notes with optional project association.
- **Key fields**: `title`, `content`, `contentText`, `pinned`, `projectId`, `createdAt`, `updatedAt`.
- **Indices**: by user, by user+project, by user+pinned, search index on title/content text.

### Inbox Items
- **Table**: `inboxItems`
- **Purpose**: Capture quick thoughts before converting to tasks/projects/notes.
- **Key fields**: `content`, `status`, `labels`, `source`, `metadata`, `createdAt`, `updatedAt`.

## AI Model Metadata

### Base Models
- **Table**: `baseModels`
- **Purpose**: Keeps model identifiers for AI selection.

### Available Models
- **Table**: `availableModels`
- **Purpose**: Stores model display info and pricing used by AI settings.

## AI Chat Persistence

### Threads
- **Table**: `thread`
- **Purpose**: Stores user chat thread metadata.
- **Key fields**: `threadId`, `title`, `snippet`, `pinned`, `projectId`, `model`, `scope`, `deletedAt`, `createdAt`, `updatedAt`.

### Thread Messages
- **Table**: `threadMessages`
- **Purpose**: Stores per-thread chat messages and parts payload.
- **Key fields**: `threadId`, `messageId`, `role`, `model`, `content`, `createdAt`, `updatedAt`.

### Usage Tracking
- **Tables**: `chatUsageTotals`, `chatUsageDaily`
- **Purpose**: Track message usage counters for chat behavior and limits.
