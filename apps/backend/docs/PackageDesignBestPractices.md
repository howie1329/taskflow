# Package Design: Routes vs Functions

## TL;DR: Same Rule for Packages

**✅ Packages should export FUNCTIONS/SERVICES, NOT routes**

Packages are just more isolated modules - same architectural principles apply!

---

## Why Packages Should NOT Include Routes

### 1. **Framework Agnostic**
Packages should work with any framework (Express, Fastify, Koa, Hono, etc.)

```javascript
// ❌ BAD: Tied to Express
export const taskRoutes = express.Router();

// ✅ GOOD: Framework agnostic
export class TaskService {
  async createTask(data) { /* ... */ }
}
```

### 2. **Reusability Across Projects**
Same package can be used in:
- REST API (Express)
- REST API (Fastify)
- GraphQL API
- CLI tool
- Background jobs
- WebSocket handlers
- Serverless functions

### 3. **Publishing to npm**
If you publish a package with routes, it's tied to Express. Others using Fastify can't use it!

### 4. **Dependency Injection**
Packages use dependency injection - routes would need framework-specific dependencies

### 5. **Separation of Concerns**
- **Package**: Business logic (domain layer)
- **Application**: HTTP routing (application layer)

---

## Proper Package Structure

### ✅ CORRECT: Package Exports Services/Controllers Only

```
packages/task-management/
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
├── package.json
└── README.md
```

**Package exports:**
```javascript
// packages/task-management/src/index.js
export { TaskService } from './services/TaskService.js';
export { SubtaskService } from './services/SubtaskService.js';
export { TaskController } from './controllers/TaskController.js';
export { SubtaskController } from './controllers/SubtaskController.js';
export { TaskOperations } from './database/TaskOperations.js';
export { SubtaskOperations } from './database/SubtaskOperations.js';

// Factory function for dependency injection
export function createTaskManagementModule(config) {
  // ... initialize with dependencies
  return {
    services: { taskService, subtaskService },
    controllers: { taskController, subtaskController },
    // ❌ NO routes!
  };
}

// ❌ NO routes exported!
```

---

## Application Layer Uses Package

### Routes in Application Layer

```
routes/
└── v1/
    └── tasks.js                    ← Routes defined here
```

```javascript
// routes/v1/tasks.js
import express from "express";
import { createTaskManagementModule } from '@taskflow/task-management';
import { db } from '../../db/index.js';
import * as schema from '../../db/schema.js';

const router = express.Router();

// Initialize package with dependencies
const taskManagement = createTaskManagementModule({
  db,
  schema,
  cacheService,
  notificationService,
  embeddingService,
});

// Get controllers from package
const { taskController } = taskManagement.controllers;

// Define routes in application layer
router.get("/user", taskController.fetchTasks);
router.post("/create", taskController.createTask);
router.patch("/update/:taskId", taskController.updateTask);
router.delete("/delete/:taskId", taskController.deleteTask);

export default router;
```

---

## Comparison: Package vs Module

| Aspect | Module | Package |
|--------|--------|---------|
| **Routes?** | ❌ No | ❌ No |
| **Exports** | Services/Controllers | Services/Controllers |
| **Routes Location** | `routes/v1/` | `routes/v1/` |
| **Same Rule?** | ✅ Yes | ✅ Yes |

**Both follow the same architectural principle!**

---

## Real-World Examples

### ✅ Good Package (npm packages)

**`@prisma/client`** - Exports database client, not routes
```javascript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// Use in your routes
```

**`@sendgrid/mail`** - Exports mail service, not routes
```javascript
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// Use in your routes
```

**`stripe`** - Exports Stripe client, not routes
```javascript
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// Use in your routes
```

### ❌ Bad Package (if it existed)

```javascript
// ❌ BAD: Package with routes
export const stripeRoutes = express.Router();
stripeRoutes.post('/charge', ...);
```

**Why bad?**
- Tied to Express
- Can't use with Fastify
- Can't use in CLI tools
- Can't use in serverless functions easily

---

## Package Export Patterns

### Pattern 1: Services Only (Minimal)
```javascript
// packages/task-management/src/index.js
export { TaskService } from './services/TaskService.js';
export { SubtaskService } from './services/SubtaskService.js';
```

**Usage:**
```javascript
import { TaskService } from '@taskflow/task-management';

const taskService = new TaskService({ /* deps */ });

// In routes
router.post("/create", async (req, res) => {
  const task = await taskService.createTask(req.body);
  res.json(task);
});
```

### Pattern 2: Services + Controllers (Recommended)
```javascript
// packages/task-management/src/index.js
export { TaskService } from './services/TaskService.js';
export { TaskController } from './controllers/TaskController.js';
```

**Usage:**
```javascript
import { TaskController } from '@taskflow/task-management';

const controller = new TaskController({ taskService });

// In routes
router.post("/create", controller.createTask);
```

### Pattern 3: Factory Function (Best for Packages)
```javascript
// packages/task-management/src/index.js
export function createTaskManagementModule(config) {
  const taskService = new TaskService(config);
  const controller = new TaskController({ taskService });
  
  return {
    services: { taskService },
    controllers: { controller },
    // ❌ NO routes!
  };
}
```

**Usage:**
```javascript
import { createTaskManagementModule } from '@taskflow/task-management';

const taskManagement = createTaskManagementModule({
  db,
  schema,
  cacheService,
});

// In routes
router.post("/create", taskManagement.controllers.controller.createTask);
```

---

## What If You Want Route Helpers?

### Option 1: Export Route Factories (Acceptable)
```javascript
// packages/task-management/src/routes/helpers.js
export function createTaskRoutes(controller) {
  // Returns route definitions, not Express router
  return [
    { method: 'GET', path: '/user', handler: controller.fetchTasks },
    { method: 'POST', path: '/create', handler: controller.createTask },
  ];
}
```

**Usage:**
```javascript
import { createTaskRoutes } from '@taskflow/task-management/routes/helpers';
import express from 'express';

const router = express.Router();
const routes = createTaskRoutes(controller);

routes.forEach(({ method, path, handler }) => {
  router[method.toLowerCase()](path, handler);
});
```

**This is acceptable** because:
- ✅ Returns data structure, not Express router
- ✅ Framework agnostic
- ✅ Application layer wires it up

### Option 2: Export Route Definitions (Acceptable)
```javascript
// packages/task-management/src/routes/definitions.js
export const taskRouteDefinitions = {
  fetchTasks: {
    method: 'GET',
    path: '/user',
    description: 'Fetch all tasks for user',
  },
  createTask: {
    method: 'POST',
    path: '/create',
    description: 'Create a new task',
  },
};
```

**This is acceptable** because:
- ✅ Just metadata, not actual routes
- ✅ Can be used for OpenAPI/Swagger generation
- ✅ Framework agnostic

---

## Summary

| Component | Package? | Module? | Location |
|-----------|----------|---------|----------|
| **Services** | ✅ Yes | ✅ Yes | Package/Module |
| **Controllers** | ✅ Yes | ✅ Yes | Package/Module |
| **Database Ops** | ✅ Yes | ✅ Yes | Package/Module |
| **Routes** | ❌ No | ❌ No | Application (`routes/`) |
| **Route Helpers** | ✅ Maybe | ✅ Maybe | Package/Module (if framework-agnostic) |

**Rule:**
- ✅ **Packages export**: Services, Controllers (functions), Database Operations
- ❌ **Packages should NOT export**: Routes, Express routers, Framework-specific code
- ✅ **Routes stay in**: `routes/v1/` in your application

**Packages and modules follow the same architectural principle!**

---

## Example: Complete Package Structure

```
packages/task-management/
├── src/
│   ├── services/
│   │   └── TaskService.js          ← Business logic
│   ├── controllers/
│   │   └── TaskController.js       ← Request handlers
│   ├── database/
│   │   └── TaskOperations.js       ← Data access
│   └── index.js                    ← Exports services/controllers
├── package.json
└── README.md

routes/v1/
└── tasks.js                         ← Routes import from package
```

**Package exports functions, application defines routes!** 🎯
