# Package Export Best Practices: Services vs Controllers

## TL;DR: Packages Should Export Services Only

**✅ Packages export: Services/Functions (business logic)**
**❌ Packages should NOT export: Controllers (HTTP layer)**

Controllers belong in the application layer, not in packages!

---

## Why Packages Should Export Services Only

### 1. **Framework Agnostic**
Controllers use `req`/`res` (Express-specific). Services are pure functions.

```javascript
// ❌ BAD: Controller tied to Express
export class TaskController {
  createTask = async (req, res) => {  // req/res are Express-specific
    const task = await this.taskService.createTask(req.body);
    return res.status(201).json({ success: true, data: task });
  };
}

// ✅ GOOD: Service is framework agnostic
export class TaskService {
  async createTask(taskData) {  // Pure function, no HTTP concerns
    const task = await this.taskOps.create(taskData);
    await this.cacheService.invalidateTasks(task.userId);
    return task;
  }
}
```

### 2. **Reusability**
Services can be used in:
- REST API (Express)
- GraphQL API
- CLI tools
- Background jobs
- WebSocket handlers
- Serverless functions
- Testing

Controllers can only be used in HTTP handlers.

### 3. **Separation of Concerns**
- **Package**: Business logic (domain layer)
- **Application**: HTTP handling (application layer)

### 4. **Testability**
Services are easier to test - no need to mock `req`/`res`.

---

## Proper Package Structure

### ✅ CORRECT: Package Exports Services Only

```
packages/task-management/
├── src/
│   ├── services/
│   │   ├── TaskService.js          ← Business logic (EXPORT THIS)
│   │   └── SubtaskService.js
│   ├── database/
│   │   ├── TaskOperations.js       ← Data access (EXPORT THIS)
│   │   └── SubtaskOperations.js
│   └── index.js                    ← Exports services only
├── package.json
└── README.md
```

**Package exports:**
```javascript
// packages/task-management/src/index.js
export { TaskService } from './services/TaskService.js';
export { SubtaskService } from './services/SubtaskService.js';
export { TaskOperations } from './database/TaskOperations.js';
export { SubtaskOperations } from './database/SubtaskOperations.js';

// Factory function
export function createTaskManagementModule(config) {
  const taskService = new TaskService(config);
  const subtaskService = new SubtaskService(config);
  
  return {
    services: {
      taskService,
      subtaskService,
    },
    // ❌ NO controllers!
  };
}
```

---

## Controllers in Application Layer

### Controllers Stay in Application

```
routes/
└── v1/
    └── tasks.js                    ← Controllers defined here
```

```javascript
// routes/v1/tasks.js
import express from "express";
import { TaskService } from '@taskflow/task-management';
import { cacheService } from '../../services/cache.js';

const router = express.Router();

// Initialize service from package
const taskService = new TaskService({
  taskOps,
  cacheService,
  notificationService,
});

// Controller defined in application layer
const taskController = {
  createTask: async (req, res) => {
    try {
      const task = await taskService.createTask({
        ...req.body,
        userId: req.userId,
      });
      return res.status(201).json({
        success: true,
        message: "Task created successfully",
        data: task,
      });
    } catch (error) {
      console.error("Create task error:", error);
      return res.status(500).json({ error: "Failed to create task" });
    }
  },

  fetchTasks: async (req, res) => {
    try {
      const tasks = await taskService.fetchTasks(req.userId);
      return res.status(200).json({
        success: true,
        message: "Tasks fetched successfully",
        data: tasks,
      });
    } catch (error) {
      console.error("Fetch tasks error:", error);
      return res.status(500).json({ error: "Failed to fetch tasks" });
    }
  },
};

// Define routes
router.post("/create", taskController.createTask);
router.get("/user", taskController.fetchTasks);

export default router;
```

---

## Comparison: Services vs Controllers

### Services (Package Layer)
```javascript
// packages/task-management/src/services/TaskService.js
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
    return task;  // Returns data, not HTTP response
  }
}
```

**Characteristics:**
- ✅ Framework agnostic
- ✅ Pure functions
- ✅ Returns data
- ✅ No HTTP concerns
- ✅ Reusable everywhere

### Controllers (Application Layer)
```javascript
// routes/v1/tasks.js (Application Layer)
const taskController = {
  createTask: async (req, res) => {
    // HTTP-specific handling
    try {
      const task = await taskService.createTask({
        ...req.body,
        userId: req.userId,
      });
      return res.status(201).json({  // HTTP response
        success: true,
        data: task,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });  // HTTP error
    }
  },
};
```

**Characteristics:**
- ❌ Framework specific (Express req/res)
- ❌ HTTP concerns (status codes, responses)
- ❌ Application-specific error handling
- ❌ Application-specific response formatting

---

## Real-World Examples

### ✅ Good Packages (Export Services)

**`@prisma/client`**
```javascript
// Package exports service/client
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Application layer creates controller
router.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});
```

**`stripe`**
```javascript
// Package exports service/client
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Application layer creates controller
router.post('/charge', async (req, res) => {
  const charge = await stripe.charges.create(req.body);
  res.json(charge);
});
```

**`@sendgrid/mail`**
```javascript
// Package exports service
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Application layer creates controller
router.post('/send-email', async (req, res) => {
  await sgMail.send(req.body);
  res.json({ success: true });
});
```

**None of these packages export controllers!**

---

## What About Controllers in Modules?

### Modules Can Have Controllers (But Still Not Routes)

For **modules** (within your workspace), controllers can be acceptable as a **convenience layer**, but they're still optional:

```javascript
// modules/task-management/src/controllers/TaskController.js
export class TaskController {
  constructor({ taskService }) {
    this.taskService = taskService;
  }

  createTask = async (req, res) => {
    // HTTP handling
  };
}
```

**Why acceptable in modules but not packages?**
- Modules are workspace-specific (you control the framework)
- Packages are meant to be reusable across projects/frameworks
- Modules can have convenience layers
- Packages should be framework-agnostic

**But even in modules, services are preferred!**

---

## Recommended Package Structure

### Minimal (Services Only) ✅ BEST
```
packages/task-management/
├── src/
│   ├── services/
│   │   └── TaskService.js          ← Export this
│   ├── database/
│   │   └── TaskOperations.js       ← Export this
│   └── index.js
```

### With Utilities (Also Good)
```
packages/task-management/
├── src/
│   ├── services/
│   │   └── TaskService.js
│   ├── database/
│   │   └── TaskOperations.js
│   ├── utils/
│   │   └── TaskValidator.js        ← Export utilities
│   └── index.js
```

### ❌ NOT Recommended
```
packages/task-management/
├── src/
│   ├── controllers/                ← ❌ Don't export controllers
│   │   └── TaskController.js
│   ├── routes/                      ← ❌ Don't export routes
│   │   └── taskRoutes.js
```

---

## Package Export Patterns

### Pattern 1: Services Only ✅ BEST
```javascript
// packages/task-management/src/index.js
export { TaskService } from './services/TaskService.js';
export { SubtaskService } from './services/SubtaskService.js';
```

**Usage:**
```javascript
import { TaskService } from '@taskflow/task-management';

const taskService = new TaskService({ /* deps */ });

// Application layer creates controller
router.post("/create", async (req, res) => {
  const task = await taskService.createTask(req.body);
  res.json(task);
});
```

### Pattern 2: Factory Function ✅ GOOD
```javascript
// packages/task-management/src/index.js
export function createTaskManagementModule(config) {
  const taskService = new TaskService(config);
  const subtaskService = new SubtaskService(config);
  
  return {
    services: {
      taskService,
      subtaskService,
    },
    // ❌ NO controllers!
  };
}
```

**Usage:**
```javascript
import { createTaskManagementModule } from '@taskflow/task-management';

const taskManagement = createTaskManagementModule({ /* deps */ });

// Application layer creates controller
router.post("/create", async (req, res) => {
  const task = await taskManagement.services.taskService.createTask(req.body);
  res.json(task);
});
```

### Pattern 3: Controllers ❌ NOT RECOMMENDED
```javascript
// ❌ Don't do this in packages
export { TaskController } from './controllers/TaskController.js';
```

**Why not?**
- Controllers are HTTP-specific
- Tied to Express (req/res)
- Not reusable in other contexts

---

## Complete Example: Proper Package

### Package (Services Only)
```javascript
// packages/task-management/src/services/TaskService.js
export class TaskService {
  constructor({ taskOps, cacheService, notificationService }) {
    this.taskOps = taskOps;
    this.cacheService = cacheService;
    this.notificationService = notificationService;
  }

  async createTask(taskData) {
    const task = await this.taskOps.create(taskData);
    await this.cacheService.invalidateTasks(task.userId);
    await this.notificationService.create({
      userId: task.userId,
      title: "Task Created",
      content: `Task ${task.title} has been created`,
    });
    return task;  // Returns data
  }

  async fetchTasks(userId) {
    return await this.taskOps.findByUserId(userId);
  }
}
```

### Application Layer (Controllers)
```javascript
// routes/v1/tasks.js
import express from "express";
import { TaskService } from '@taskflow/task-management';
import { cacheService } from '../../services/cache.js';
import { notificationService } from '../../services/notifications.js';

const router = express.Router();

// Initialize service from package
const taskService = new TaskService({
  taskOps,
  cacheService,
  notificationService,
});

// Controller in application layer
router.post("/create", async (req, res) => {
  try {
    const task = await taskService.createTask({
      ...req.body,
      userId: req.userId,
    });
    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    console.error("Create task error:", error);
    return res.status(500).json({ error: "Failed to create task" });
  }
});

router.get("/user", async (req, res) => {
  try {
    const tasks = await taskService.fetchTasks(req.userId);
    return res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      data: tasks,
    });
  } catch (error) {
    console.error("Fetch tasks error:", error);
    return res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

export default router;
```

---

## Summary

| Component | Package? | Module? | Location |
|-----------|----------|---------|----------|
| **Services** | ✅ Yes | ✅ Yes | Package/Module |
| **Database Ops** | ✅ Yes | ✅ Yes | Package/Module |
| **Utilities** | ✅ Yes | ✅ Yes | Package/Module |
| **Controllers** | ❌ No | ⚠️ Optional | Application Layer |
| **Routes** | ❌ No | ❌ No | Application Layer |

**Rule:**
- ✅ **Packages export**: Services, Database Operations, Utilities (functions only)
- ❌ **Packages should NOT export**: Controllers, Routes
- ✅ **Controllers belong in**: Application layer (`routes/v1/`)

**Packages = Pure business logic. Controllers = HTTP layer in application!** 🎯
