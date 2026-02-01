# Convex Data Model Implementation

## Overview

This document outlines the implementation of the core Convex data model for Taskflow v1, focusing on four primary collections: `projects`, `tasks`, `subtasks`, and `tags`.

## Collections

### 1. Projects

**Purpose**: Group tasks and notes into meaningful work buckets.

```typescript
{
  userId: string,
  title: string,
  description: string,
  status: "active" | "archived" | "deleted",
  color: string,              // Hex color: "#ff5733"
  icon: string,               // Emoji/icon identifier
  createdAt: number,
  updatedAt: number
}
```

**Indexes**:

- `["userId"]`
- `["userId", "status"]`

### 2. Tags

**Purpose**: Flexible tagging system with metadata for organizing and filtering tasks.

```typescript
{
  userId: string,
  name: string,
  color: string,              // Hex color: "#ff5733"
  usageCount: number,
  createdAt: number
}
```

**Indexes**:

- `["userId"]`
- `["userId", "usageCount"]`

### 3. Tasks

**Purpose**: Primary execution unit with comprehensive task management capabilities.

```typescript
{
  // Core fields
  userId: string,
  title: string,
  description: string,
  status: "Not Started" | "To Do" | "In Progress" | "Completed",
  priority: "low" | "medium" | "high",

  // Dates
  dueDate: number | null,           // Timestamp
  scheduledDate: string | null,     // YYYY-MM-DD
  completionDate: number | null,    // When actually completed

  // Relationships
  projectId: Id<"projects"> | null,
  tagIds: Id<"tags">[],
  parentTaskId: Id<"tasks"> | null,

  // Enhanced task management
  estimatedDuration: number | null,  // Minutes
  actualDuration: number | null,    // Minutes
  energyLevel: "low" | "medium" | "high",
  context: string[],                // @home, @office, @calls, etc.
  source: "inbox" | "created" | "ai-suggested",
  orderIndex: number,

  // AI & Intelligence
  aiSummary: string | null,
  aiContext: any,                  // Flexible AI analysis data
  embedding: array<number> | null,  // For future semantic search

  // Metadata
  lastActiveAt: number,
  streakCount: number,
  difficulty: "easy" | "medium" | "hard",
  isTemplate: boolean,

  // Timestamps
  createdAt: number,
  updatedAt: number
}
```

**Indexes**:

- `["userId"]`
- `["userId", "status"]`
- `["userId", "projectId"]`
- `["userId", "scheduledDate"]`
- `["userId", "dueDate"]`
- `["userId", "priority"]`
- `["userId", "lastActiveAt"]`
- `["userId", "parentTaskId"]`
- `["userId", "tagIds"]`

### 4. Subtasks

**Purpose**: Lightweight checklists under tasks for breaking down complex work.

```typescript
{
  userId: string,
  taskId: Id<"tasks">,
  title: string,
  isComplete: boolean,
  orderIndex: number,
  createdAt: number,
  updatedAt: number
}
```

**Indexes**:

- `["userId"]`
- `["userId", "taskId"]`

## Implementation Steps

### Phase 1: Schema Definition

1. Update `apps/web/convex/schema.ts` with all four collections
2. Define proper TypeScript types and indexes
3. Set default values where appropriate

### Phase 2: Type Generation

1. Run `npx convex dev` to regenerate TypeScript definitions
2. Verify all types are properly generated in `_generated/dataModel.d.ts`

### Phase 3: Basic Operations

1. Create CRUD mutations for each collection:
   - `projects.create()`, `projects.update()`, `projects.delete()`
   - `tasks.create()`, `tasks.update()`, `tasks.delete()`, `tasks.setComplete()`
   - `subtasks.create()`, `subtasks.update()`, `subtasks.delete()`, `subtasks.toggle()`
   - `tags.create()`, `tags.update()`, `tags.delete()`

2. Create essential query functions:
   - `projects.list()`, `projects.get()`
   - `tasks.list()`, `tasks.get()`, `tasks.findByStatus()`, `tasks.findByProject()`
   - `subtasks.listByTask()`, `tags.list()`

### Phase 4: Validation & Permissions

1. Implement user scoping validation
2. Add field validation for enums and required fields
3. Ensure relationship integrity (projectId, tagIds belong to same user)

## Key Design Decisions

### Status Management

- **Tasks**: Four-state system: "Not Started" → "To Do" → "In Progress" → "Completed"
- **Projects**: Three-state system: "active", "archived", "deleted"
- **Default Values**: Tasks default to "Not Started" with "low" priority

### Relationship Strategy

- **Task ↔ Project**: Many-to-one via `projectId`
- **Task ↔ Tags**: Many-to-many via `tagIds` array
- **Subtask ↔ Task**: Many-to-one via `taskId`
- **Task Dependencies**: Simple parent-child via `parentTaskId`

### AI Integration

- **Immediate**: `aiSummary`, `aiContext` fields available
- **Future**: `embedding` field reserved for semantic search
- **Flexibility**: `aiContext` uses `any` type for evolving structure

### Date Strategy

- **Deadlines**: `dueDate` as timestamp for precise timing
- **Scheduling**: `scheduledDate` as YYYY-MM-DD string for day-based planning
- **Tracking**: `completionDate` for analytics

## API Surface Preview

### Projects

```typescript
// Queries
projects.list({ status? })
projects.get({ id })

// Mutations
projects.create({ title, description?, color?, icon? })
projects.update({ id, patch })
projects.archive({ id })
projects.delete({ id })
```

### Tasks

```typescript
// Queries
tasks.list({ status?, projectId?, scheduledDate?, tagIds? })
tasks.get({ id })
tasks.findByProject({ projectId })
tasks.findByScheduledDate({ date })

// Mutations
tasks.create({ title, description?, priority?, dueDate?, scheduledDate?, projectId?, tagIds? })
tasks.update({ id, patch })
tasks.setStatus({ id, status })
tasks.setPriority({ id, priority })
tasks.setScheduledDate({ id, scheduledDate })
tasks.delete({ id })
```

### Subtasks

```typescript
// Queries
subtasks.listByTask({ taskId });
subtasks.get({ id });

// Mutations
subtasks.create({ taskId, title });
subtasks.update({ id, patch });
subtasks.toggle({ id });
subtasks.delete({ id });
```

### Tags

```typescript
// Queries
tags.list()
tags.get({ id })

// Mutations
tags.create({ name, color? })
tags.update({ id, patch })
tags.incrementUsage({ id })
tags.delete({ id })
```

## Testing Strategy

### Unit Tests

- Schema validation
- CRUD operations
- Index performance
- Relationship integrity

### Integration Tests

- User scoping enforcement
- Cross-collection operations
- Complex query scenarios
- AI field operations

### Performance Tests

- Large dataset handling
- Index effectiveness
- Query response times
- Concurrent operations

## Migration Considerations

### From Legacy System

- Map existing PostgreSQL data to new schema
- Handle data type conversions
- Preserve relationships and metadata
- Maintain user associations

### Future Extensibility

- Reserved fields for AI features
- Flexible `aiContext` structure
- Embedding vector storage
- Advanced analytics metadata

## Security Notes

### User Scoping

- Every operation must validate `userId` ownership
- Relationships must verify same-user ownership
- No cross-user data access

### Data Validation

- Enum validation for status/priority fields
- Required field validation
- Relationship existence checks
- Input sanitization

## Next Steps

1. **Immediate**: Implement schema in `convex/schema.ts`
2. **Short-term**: Create basic CRUD operations
3. **Medium-term**: Implement validation and permissions
4. **Long-term**: Add AI features and advanced analytics

---

**Last Updated**: 2026-01-31
**Version**: 1.0
**Next Review**: Post-schema implementation
