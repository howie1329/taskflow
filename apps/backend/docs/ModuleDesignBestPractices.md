# Module Design: Routes vs Functions

## TL;DR: Best Practice

**✅ Modules should export FUNCTIONS/SERVICES, NOT routes**

Routes are application-level concerns and should stay in your `routes/` directory.

---

## Why Modules Should NOT Include Routes

### 1. **Framework Agnostic**
Modules should work with any framework (Express, Fastify, Koa, etc.)

```javascript
// ❌ BAD: Tied to Express
export const taskRoutes = express.Router();

// ✅ GOOD: Framework agnostic
export class TaskService {
  async createTask(data) { /* ... */ }
}
```

### 2. **Separation of Concerns**
- **Module**: Business logic (domain layer)
- **Routes**: HTTP layer (application layer)

### 3. **Reusability**
Same module can be used in:
- REST API
- GraphQL API
- CLI tool
- Background jobs
- WebSocket handlers

### 4. **Testability**
Easier to test business logic without HTTP concerns

### 5. **Flexibility**
Different apps might want different route structures

---

## Proper Module Structure

### ✅ CORRECT: Module Exports Services/Controllers Only

```
modules/task-management/
├── src/
│   ├── services/
│   │   ├── TaskService.js          ← Business logic
│   │   └── SubtaskService.js
│   ├── controllers/
│   │   ├── TaskController.js       ← Request handlers (optional)
│   │   └── SubtaskController.js
│   ├── database/
│   │   ├── TaskOperations.js       ← Data access
│   │   └── SubtaskOperations.js
│   └── index.js                    ← Exports services/controllers
└── README.md
```

**Module exports:**
```javascript
// modules/task-management/src/index.js
export { TaskService } from './services/TaskService.js';
export { SubtaskService } from './services/SubtaskService.js';
export { TaskController } from './controllers/TaskController.js';
export { SubtaskController } from './controllers/SubtaskController.js';
export { TaskOperations } from './database/TaskOperations.js';
export { SubtaskOperations } from './database/SubtaskOperations.js';

// ❌ NO routes exported!
```

---

## Application Layer Uses Module

### Routes in Application Layer

```
routes/
└── v1/
    └── tasks.js                    ← Routes defined here
```

```javascript
// routes/v1/tasks.js
import express from "express";
import { TaskController } from '../../modules/task-management/src/index.js';

const router = express.Router();

// Initialize controller
const taskController = new TaskController({
  taskService: new TaskService(),
  subtaskService: new SubtaskService(),
});

// Define routes in application layer
router.get("/user", taskController.fetchTasks);
router.get("/user/:taskId", taskController.fetchSingleTask);
router.post("/create", taskController.createTask);
router.patch("/update/:taskId", taskController.updateTask);
router.delete("/delete/:taskId", taskController.deleteTask);

export default router;
```

---

## Two Approaches Compared

### Approach 1: Module with Routes (❌ Not Recommended)

```javascript
// modules/task-management/src/routes/taskRoutes.js
import express from "express";
import { TaskController } from '../controllers/TaskController.js';

const router = express.Router();

router.get("/user", (req, res) => {
  const controller = new TaskController();
  return controller.fetchTasks(req, res);
});

export default router;  // ❌ Routes exported from module
```

**Problems:**
- ❌ Tied to Express framework
- ❌ Can't use with Fastify/Koa/etc.
- ❌ Routes can't be customized per app
- ❌ Mixes HTTP concerns with business logic

---

### Approach 2: Module Exports Functions Only (✅ Recommended)

```javascript
// modules/task-management/src/services/TaskService.js
export class TaskService {
  async createTask(taskData) {
    // Business logic only - no HTTP concerns
    const task = await this.taskOps.create(taskData);
    await this.cacheService.invalidateTasks(task.userId);
    return task;
  }

  async fetchTasks(userId) {
    return await this.taskOps.findByUserId(userId);
  }
}
```

```javascript
// routes/v1/tasks.js (Application Layer)
import express from "express";
import { TaskService } from '../../modules/task-management/src/index.js';

const router = express.Router();
const taskService = new TaskService({ /* dependencies */ });

// Routes defined in application layer
router.post("/create", async (req, res) => {
  try {
    const task = await taskService.createTask({
      ...req.body,
      userId: req.userId,
    });
    return res.status(201).json({ success: true, data: task });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
```

**Benefits:**
- ✅ Framework agnostic
- ✅ Reusable across different apps
- ✅ Clear separation of concerns
- ✅ Easy to test
- ✅ Flexible route structure

---

## Controller Pattern (Optional Middle Layer)

You can have controllers in modules, but they should be **request handlers**, not route definitions:

```javascript
// modules/task-management/src/controllers/TaskController.js
export class TaskController {
  constructor({ taskService }) {
    this.taskService = taskService;
  }

  // Request handler - takes req/res, calls service
  createTask = async (req, res) => {
    try {
      const task = await this.taskService.createTask({
        ...req.body,
        userId: req.userId,
      });
      return res.status(201).json({ success: true, data: task });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };
}
```

```javascript
// routes/v1/tasks.js - Routes wire up controllers
import { TaskController } from '../../modules/task-management/src/index.js';

const router = express.Router();
const controller = new TaskController({ taskService });

router.post("/create", controller.createTask);  // Wire up route
router.get("/user", controller.fetchTasks);
```

**This is acceptable** because:
- ✅ Controllers are still framework-agnostic (just functions)
- ✅ Routes are still in application layer
- ✅ Provides convenience layer

---

## Recommended Module Structure

### Minimal (Services Only)
```
modules/task-management/
├── src/
│   ├── services/
│   │   └── TaskService.js
│   ├── database/
│   │   └── TaskOperations.js
│   └── index.js
```

### With Controllers (Recommended)
```
modules/task-management/
├── src/
│   ├── services/
│   │   └── TaskService.js          ← Business logic
│   ├── controllers/
│   │   └── TaskController.js       ← Request handlers (optional)
│   ├── database/
│   │   └── TaskOperations.js       ← Data access
│   └── index.js                    ← Exports services/controllers
```

### ❌ NOT Recommended
```
modules/task-management/
├── src/
│   ├── routes/                      ← ❌ Routes don't belong here
│   │   └── taskRoutes.js
```

---

## Real-World Example

### Module (Business Logic)
```javascript
// modules/task-management/src/services/TaskService.js
export class TaskService {
  async createTask(taskData) {
    // Pure business logic
    const task = await this.taskOps.create(taskData);
    await this.cacheService.invalidateTasks(task.userId);
    await this.notificationService.create({
      userId: task.userId,
      title: "Task Created",
      content: `Task ${task.title} has been created`,
    });
    return task;
  }
}
```

### Application Layer (Routes)
```javascript
// routes/v1/tasks.js
import express from "express";
import { TaskService } from '../../modules/task-management/src/index.js';
import { cacheService } from '../../services/cache.js';
import { notificationService } from '../../services/notifications.js';

const router = express.Router();

// Initialize service with dependencies
const taskService = new TaskService({
  taskOps,
  cacheService,
  notificationService,
});

// Define routes
router.post("/create", async (req, res) => {
  try {
    const task = await taskService.createTask({
      ...req.body,
      userId: req.userId,
    });
    return res.status(201).json({ success: true, data: task });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
```

---

## When Controllers Make Sense

Controllers are useful when:
- ✅ You want to standardize request/response handling
- ✅ You want to share error handling logic
- ✅ You want a convenience layer between routes and services

But controllers should still be:
- ✅ Framework-agnostic functions
- ✅ Imported by routes (not exported as routes)
- ✅ Optional (you can call services directly from routes)

---

## Summary

| Component | Location | Purpose | Framework Dependency |
|-----------|----------|---------|---------------------|
| **Services** | Module | Business logic | ❌ None |
| **Controllers** | Module (optional) | Request handlers | ❌ None (just functions) |
| **Database Ops** | Module | Data access | ❌ None |
| **Routes** | Application (`routes/`) | HTTP routing | ✅ Express/Fastify/etc. |

**Rule of Thumb:**
- ✅ Module exports: Services, Controllers (functions), Database Operations
- ❌ Module should NOT export: Routes, Express-specific code

**Your routes stay in `routes/v1/` and import from modules!**
