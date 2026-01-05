# Coding Patterns & Architecture Guide

## Overview

This document outlines the coding patterns, architectural decisions, and best practices used in the TaskFlow backend. These patterns were established to reduce code duplication, improve maintainability, and create a consistent developer experience.

---

## Table of Contents

1. [Core Philosophy](#core-philosophy)
2. [Implemented Patterns](#implemented-patterns)
3. [File Structure](#file-structure)
4. [Recommended Patterns](#recommended-patterns)
5. [Migration Guide](#migration-guide)

---

## Core Philosophy

### The Five Principles

1. **Factory Pattern** - Create objects with consistent structure
2. **Encapsulation** - Hide complexity behind clean interfaces
3. **DRY (Don't Repeat Yourself)** - Eliminate repetitive code
4. **Single Responsibility** - Each class/function does one thing well
5. **Builder Pattern** - Progressive state management

### When to Apply These Patterns

Look for these indicators:
- ✅ Code appearing in 3+ places
- ✅ Similar try-catch blocks
- ✅ Repetitive object creation
- ✅ Complex state tracking
- ✅ Manual error handling

---

## Implemented Patterns

### 1. Artifact System (AI Tools)

**Location:** `utils/AiTools/ArtifactHelpers.js`

**Problem Solved:** AI tools needed consistent state tracking and data formatting for frontend display.

**Pattern Used:** Factory + Builder Pattern

#### Components

```javascript
// Status Constants
export const ArtifactStatus = {
  PENDING: "pending",
  LOADING: "loading",
  COMPLETE: "complete",
  ERROR: "error",
};

// Factory Function
export const createArtifactData = ({
  status,
  toolName,
  message,
  input,
  outputs = null,
  error = null,
  duration = null,
}) => ({
  status,
  toolName,
  message,
  input,
  outputs,
  error,
  timestamp: new Date().toISOString(),
  ...(duration !== null && { duration }),
});

// Builder Class
export class ArtifactWriter {
  constructor(writer, toolName) {
    this.writer = writer;
    this.toolName = toolName;
    this.artifactId = null;
    this.startTime = null;
  }

  loading(input, message) { /* ... */ }
  complete(input, outputs, message) { /* ... */ }
  error(input, error, message) { /* ... */ }
}
```

#### Usage Example

```javascript
// Before: 30+ lines of boilerplate
webSearch: new tool({
  execute: async ({ query }) => {
    writer.write({ type: "data-web-search", id: "...", data: { status: "loading" }});
    const result = await exa.search(query);
    writer.write({ type: "data-web-search", id: "...", data: { status: "complete" }});
    return result;
  }
});

// After: 8 lines, automatic error handling, duration tracking, unique IDs
webSearch: new tool({
  execute: async ({ query }) => {
    const artifact = new ArtifactWriter(writer, "WebSearch");
    try {
      artifact.loading({ query }, `Searching for: "${query}"`);
      const result = await exa.search(query);
      artifact.complete({ query }, { sources: result.results }, "Search complete");
      return result;
    } catch (error) {
      artifact.error({ query }, error, "Search failed");
      throw error;
    }
  }
});
```

#### Benefits

- ✅ **90% less boilerplate** - From 30 lines to 8 lines per tool
- ✅ **Automatic tracking** - Duration, timestamps, unique IDs
- ✅ **Consistent structure** - All artifacts have same shape
- ✅ **Error safety** - Errors always captured and formatted
- ✅ **Frontend ready** - Status field enables UI state management

#### Files Using This Pattern

- `utils/AiTools/VercelAITools.js` - All 18 tools updated
- See: `ARTIFACT_SYSTEM.md` for detailed documentation

---

## File Structure

### Current Structure

```
apps/backend/
├── controllers/          # HTTP request handlers
├── services/            # Business logic
├── db/
│   ├── operations/      # Data access layer (CRUD)
│   └── schema.js        # Database schema
├── routes/             # API routing
├── middleware/         # Auth, logging, etc.
├── utils/              # Shared utilities
│   ├── AIPrompts/
│   └── AiTools/
├── sockets/            # Real-time communication
└── docs/               # Documentation
```

### Recommended Structure (Future)

```
apps/backend/
├── api/                      # NEW: Group by feature
│   ├── tasks/
│   │   ├── task.controller.js
│   │   ├── task.service.js
│   │   ├── task.routes.js
│   │   └── task.validation.js
│   ├── notes/
│   └── projects/
│
├── core/                     # NEW: Shared infrastructure
│   ├── errors/
│   │   ├── AppError.js
│   │   ├── NotFoundError.js
│   │   ├── ValidationError.js
│   │   └── index.js
│   │
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   ├── auth.js
│   │   └── logger.js
│   │
│   ├── utils/
│   │   ├── ResponseHandler.js
│   │   ├── ServiceHandler.js
│   │   ├── CRUDBuilder.js
│   │   └── logger.js
│   │
│   └── database/
│       ├── operations/
│       └── schema.js
│
├── features/                # NEW: Domain-specific modules
│   ├── ai-chat/
│   │   ├── services/
│   │   ├── tools/
│   │   └── prompts/
│   └── notifications/
│
└── config/                  # NEW: Configuration
    ├── constants.js
    └── index.js
```

---

## Recommended Patterns

### 1. ResponseHandler (Controllers)

**Problem:** Every controller has identical try-catch blocks (37 occurrences!)

**Impact:** 🔴 HIGH - Affects all 9 controller files

#### Implementation

```javascript
// core/utils/ResponseHandler.js
export class ResponseHandler {
  constructor(res) {
    this.res = res;
  }

  success(data, message = "Success", statusCode = 200) {
    return this.res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  created(data, message = "Created successfully") {
    return this.success(data, message, 201);
  }

  error(error, fallbackMessage = "Operation failed") {
    console.error(fallbackMessage + ":", error);
    
    const statusCode = error.statusCode || 500;
    const message = error.userMessage || fallbackMessage;
    
    return this.res.status(statusCode).json({
      success: false,
      error: message,
    });
  }
}

export const asyncHandler = (fn) => {
  return async (req, res, next) => {
    const response = new ResponseHandler(res);
    try {
      await fn(req, res, response);
    } catch (error) {
      response.error(error);
    }
  };
};
```

#### Usage

```javascript
// Before: 12 lines
export const createTask = async (req, res) => {
  try {
    const task = await taskService.createTask(req.body);
    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    console.error("Create task error:", error);
    return res.status(500).json({ error: "Failed to create task" });
  }
};

// After: 4 lines
export const createTask = asyncHandler(async (req, res, response) => {
  const task = await taskService.createTask(req.body);
  return response.created(task, "Task created successfully");
});
```

**Estimated Savings:** ~400 lines across all controllers

---

### 2. ServiceHandler (Services)

**Problem:** Services have repetitive patterns (embedding, caching, notifications, socket events)

**Impact:** 🔴 HIGH - Affects 4 service files

#### Implementation

```javascript
// core/utils/ServiceHandler.js
export class ServiceHandler {
  constructor(operations, options = {}) {
    this.ops = operations;
    this.shouldCache = options.cache ?? true;
    this.shouldNotify = options.notify ?? true;
    this.shouldEmit = options.emit ?? true;
    this.shouldEmbed = options.embed ?? false;
  }

  async create(data, config = {}) {
    // Auto-embedding
    if (this.shouldEmbed && config.embedFields) {
      const text = config.embedFields.map(f => data[f]).join(" ");
      data.vector = await embeddingService.createEmbedding(text);
    }

    // Perform operation
    const result = await this.ops.create(data);

    // Auto-cache invalidation
    if (this.shouldCache && config.cacheKey) {
      await cacheService.invalidate(config.cacheKey, data.userId);
    }

    // Auto-notification
    if (this.shouldNotify && config.notification) {
      await createNotificationJob({
        userId: data.userId,
        ...config.notification(result),
      });
    }

    // Auto-emit
    if (this.shouldEmit && config.event) {
      emitToRoom(data.userId, config.event, { id: result.id });
    }

    return result;
  }

  async update(id, userId, updates, config = {}) {
    // Similar pattern...
  }

  async delete(id, userId, config = {}) {
    // Similar pattern...
  }
}
```

#### Usage

```javascript
// Before: 30 lines with manual embedding, caching, notifications
export const taskService = {
  async createTask(taskData) {
    const embedding = await embeddingService.createEmbedding(
      taskData.title + " " + taskData.description
    );
    taskData.vector = embedding;
    const task = await taskOps.create(taskData);
    
    if (task) {
      await cacheService.invalidateTasks(task.userId);
      await createNotificationJob({
        userId: taskData.userId,
        title: "Task Created",
        content: `Task ${taskData.title} has been created`,
      });
    }
    return task;
  },
};

// After: 10 lines with automatic features
const taskHandler = new ServiceHandler(taskOps, {
  cache: true,
  notify: true,
  embed: true,
});

export const taskService = {
  async createTask(taskData) {
    return await taskHandler.create(taskData, {
      embedFields: ['title', 'description'],
      cacheKey: 'tasks',
      notification: (task) => ({
        title: "Task Created",
        content: `Task ${task.title} has been created`,
      }),
      event: 'task-created',
    });
  },
};
```

**Estimated Savings:** ~200 lines across service files

---

### 3. Error Class Hierarchy

**Problem:** Generic errors everywhere, no differentiation

**Impact:** 🔴 HIGH - Better debugging and user experience

#### Implementation

```javascript
// core/errors/AppError.js
export class AppError extends Error {
  constructor(message, statusCode, userMessage) {
    super(message);
    this.statusCode = statusCode;
    this.userMessage = userMessage || message;
    this.isOperational = true;
  }
}

// core/errors/NotFoundError.js
export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(
      `${resource} not found`,
      404,
      `The requested ${resource.toLowerCase()} could not be found`
    );
  }
}

// core/errors/ValidationError.js
export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, message);
  }
}

// core/errors/UnauthorizedError.js
export class UnauthorizedError extends AppError {
  constructor() {
    super("Unauthorized", 401, "You are not authorized to perform this action");
  }
}

// core/errors/DatabaseError.js
export class DatabaseError extends AppError {
  constructor(operation, error) {
    super(
      `Database ${operation} failed: ${error.message}`,
      500,
      "A database error occurred. Please try again."
    );
  }
}
```

#### Usage

```javascript
// Before: Generic error handling
if (!task) {
  return res.status(404).json({ error: "Task not found" });
}

// After: Typed errors
if (!task) {
  throw new NotFoundError("Task");
}
// ResponseHandler catches and formats automatically

// Validation
if (!taskData.title) {
  throw new ValidationError("Task title is required");
}

// Database errors
try {
  const task = await taskOps.create(taskData);
} catch (error) {
  throw new DatabaseError("create task", error);
}
```

**Benefits:**
- ✅ Proper HTTP status codes
- ✅ User-friendly error messages
- ✅ Developer-friendly logging
- ✅ Error monitoring integration ready

---

### 4. CRUDBuilder (Database Operations)

**Problem:** All services have similar CRUD patterns

**Impact:** 🟡 MEDIUM - Reduces boilerplate in database layer

#### Implementation

```javascript
// core/utils/CRUDBuilder.js
export class CRUDBuilder {
  constructor(ops, config = {}) {
    this.ops = ops;
    this.entityName = config.entityName || "Item";
    this.hooks = config.hooks || {};
  }

  async create(data) {
    await this.hooks.beforeCreate?.(data);
    const result = await this.ops.create(data);
    await this.hooks.afterCreate?.(result);
    return result;
  }

  async findById(id, userId) {
    const result = await this.ops.findById(id, userId);
    if (!result) {
      throw new NotFoundError(this.entityName);
    }
    return result;
  }

  async update(id, userId, updates) {
    await this.hooks.beforeUpdate?.(updates);
    const result = await this.ops.update(id, userId, updates);
    if (!result) {
      throw new NotFoundError(this.entityName);
    }
    await this.hooks.afterUpdate?.(result);
    return result;
  }

  async delete(id, userId) {
    const result = await this.ops.delete(id, userId);
    if (!result) {
      throw new NotFoundError(this.entityName);
    }
    return result;
  }
}
```

---

## Migration Guide

### Phase 1: Quick Wins (Week 1)

**Priority:** Extract utility functions

1. Create `core/utils/` directory
2. Move `ArtifactHelpers.js` pattern to other areas
3. Extract common functions to utilities
4. Update imports

**Checklist:**
- [ ] Create error classes
- [ ] Implement ResponseHandler
- [ ] Test with one controller
- [ ] Roll out to remaining controllers

### Phase 2: Service Layer (Week 2)

**Priority:** Standardize service patterns

1. Implement ServiceHandler
2. Update task service first (test pattern)
3. Apply to notes, projects, subtasks services
4. Update tests

**Checklist:**
- [ ] Create ServiceHandler class
- [ ] Refactor taskService
- [ ] Refactor noteService
- [ ] Refactor projectService
- [ ] Update integration tests

### Phase 3: Architecture (Week 3+)

**Priority:** Restructure file organization

1. Plan feature-based structure
2. Create migration script
3. Move files incrementally
4. Update imports and tests

**Checklist:**
- [ ] Design new folder structure
- [ ] Create migration plan
- [ ] Migrate one feature (tasks)
- [ ] Update documentation
- [ ] Migrate remaining features

---

## Pattern Template

When creating new patterns, use this template:

```markdown
### Pattern Name

**Problem:** What problem does this solve?

**Impact:** 🔴 HIGH | 🟡 MEDIUM | 🟢 LOW

**Files Affected:** List of files

#### Implementation
[Code example]

#### Usage
[Before/After example]

#### Benefits
- List benefits

#### Estimated Savings
Lines of code or time saved
```

---

## Resources

- [Artifact System Documentation](./ARTIFACT_SYSTEM.md)
- [Backend Improvement Analysis](./BACKEND_IMPROVEMENT_ANALYSIS.md)
- [Package Design Best Practices](./PackageDesignBestPractices.md)

---

## Changelog

- **2025-12-27**: Created document
- **2025-12-27**: Implemented Artifact System pattern
- **2025-12-27**: Documented ResponseHandler, ServiceHandler patterns

---

## Contributing

When adding new patterns:
1. Identify repetition (3+ occurrences)
2. Extract common structure
3. Create abstraction
4. Test with real use cases
5. Document here
6. Update affected code

