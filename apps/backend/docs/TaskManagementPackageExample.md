# Task Management Package Example

This shows the **Package** approach - a standalone package with its own `package.json` and dependencies.

## Directory Structure

```
/workspace/
├── packages/
│   └── task-management/
│       ├── src/
│       │   ├── services/
│       │   │   ├── TaskService.js          # Business logic (EXPORT THIS)
│       │   │   └── SubtaskService.js
│       │   ├── database/
│       │   │   ├── TaskOperations.js       # Data access (EXPORT THIS)
│       │   │   └── SubtaskOperations.js
│       │   └── index.js                    # Exports services only
│       │
│       └── controllers/                    # ❌ Controllers DON'T belong in packages!
│           └── TaskController.js           # Controllers belong in application layer
│       │
│       └── routes/                         # ❌ Routes DON'T belong here!
│           └── v1/
│               ├── tasks.js                # Routes belong in application layer
│               └── subtasks.js
│       ├── tests/
│       ├── package.json              # Own package.json!
│       ├── README.md
│       └── tsconfig.json             # Optional TypeScript config
│
├── package.json                      # Root workspace config
└── pnpm-workspace.yaml               # Workspace config (if using pnpm)
```

## Package Configuration

### `packages/task-management/package.json`
```json
{
  "name": "@taskflow/task-management",
  "version": "1.0.0",
  "description": "Task and subtask management module for Taskflow",
  "type": "module",
  "main": "./src/index.js",
  "exports": {
    ".": "./src/index.js",
    "./services": "./src/services/index.js",
    "./controllers": "./src/controllers/index.js",
    "./routes": "./src/routes/index.js"
  },
  "scripts": {
    "test": "node --test tests/**/*.test.js",
    "lint": "eslint src/**/*.js"
  },
  "dependencies": {
    "drizzle-orm": "^0.44.5"
  },
  "peerDependencies": {
    "express": "^5.1.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/express": "^4.17.21"
  }
}
```

### Root `package.json` (Workspace Setup)
```json
{
  "name": "taskflow-backend",
  "version": "1.0.0",
  "type": "module",
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^5.1.0",
    "cors": "^2.8.5",
    "@clerk/express": "^1.7.28"
  }
}
```

### `pnpm-workspace.yaml` (if using pnpm)
```yaml
packages:
  - 'packages/*'
```

## Core Implementation Files

### `packages/task-management/src/index.js`
```javascript
/**
 * Task Management Package
 * Main entry point - exports all public APIs
 */

// Services (Business Logic) - Export these!
export { TaskService } from './services/TaskService.js';
export { SubtaskService } from './services/SubtaskService.js';

// Database Operations (Data Access) - Export these!
export { TaskOperations } from './database/TaskOperations.js';
export { SubtaskOperations } from './database/SubtaskOperations.js';

// ❌ NO Controllers - Controllers belong in application layer!
// ❌ NO Routes - Routes belong in application layer!

// ❌ NO ROUTES - Routes belong in application layer (routes/v1/)

// Factory function for dependency injection
export function createTaskManagementModule(config) {
  const {
    db,
    schema,
    cacheService,
    notificationService,
    embeddingService,
    noteOperations,
  } = config;

  const taskOps = new TaskOperations({ db, schema });
  const subtaskOps = new SubtaskOperations({ db, schema });
  
  const taskService = new TaskService({
    taskOps,
    subtaskOps,
    noteOps,
    cacheService,
    notificationService,
    embeddingService,
  });

  const subtaskService = new SubtaskService({ subtaskOps });

  return {
    services: {
      taskService,
      subtaskService,
    },
    operations: {
      taskOps,
      subtaskOps,
    },
    // ❌ NO controllers - Controllers belong in application layer!
    // ❌ NO routes - Routes belong in application layer!
  };
}
```

### `packages/task-management/src/services/TaskService.js`
```javascript
/**
 * TaskService
 * Business logic for task management
 * 
 * NOTE: All dependencies must be injected - NO direct imports from parent workspace!
 */
export class TaskService {
  constructor(dependencies) {
    const {
      taskOps,
      subtaskOps,
      noteOps,
      cacheService,
      notificationService,
      embeddingService,
    } = dependencies;

    if (!taskOps) throw new Error('TaskOperations is required');
    if (!subtaskOps) throw new Error('SubtaskOperations is required');
    if (!noteOps) throw new Error('NoteOperations is required');
    if (!cacheService) throw new Error('CacheService is required');
    if (!notificationService) throw new Error('NotificationService is required');
    if (!embeddingService) throw new Error('EmbeddingService is required');

    this.taskOps = taskOps;
    this.subtaskOps = subtaskOps;
    this.noteOps = noteOps;
    this.cacheService = cacheService;
    this.notificationService = notificationService;
    this.embeddingService = embeddingService;
  }

  /**
   * Create a new task
   */
  async createTask(taskData) {
    // Create embedding for task
    const embedding = await this.embeddingService.createEmbedding(
      `${taskData.title} ${taskData.description}`
    );
    taskData.vector = embedding;

    const task = await this.taskOps.create(taskData);

    if (task) {
      await this.cacheService.invalidateTasks(task.userId);

      // Create notification
      await this.notificationService.createJob({
        userId: taskData.userId,
        title: "Task Created",
        content: `Task ${taskData.title} has been created`,
      });
    }

    return task;
  }

  /**
   * Fetch all tasks for a user
   */
  async fetchTasks(userId) {
    const cacheStatus = await this.cacheService.status();
    
    if (cacheStatus) {
      const cachedTasks = await this.cacheService.fetchTasks(userId);
      if (cachedTasks.length > 0) {
        return cachedTasks;
      }
    }

    const tasks = await this.taskOps.findByUserId(userId);
    
    if (cacheStatus && tasks.length > 0) {
      await this.cacheService.addTasks(userId, tasks);
    }
    
    return tasks;
  }

  /**
   * Fetch a single task by ID
   */
  async fetchSingleTask(taskId, userId) {
    return await this.taskOps.findById(taskId, userId);
  }

  /**
   * Update a task
   */
  async updateTask(taskId, userId, updates) {
    const task = await this.taskOps.update(taskId, userId, updates);

    if (task) {
      await this.cacheService.invalidateTasks(userId);

      await this.notificationService.createJob({
        userId: task.userId,
        title: "Task Updated",
        content: `Task ${task.title} has been updated`,
      });
    }

    return task;
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId, userId) {
    const task = await this.taskOps.delete(taskId, userId);

    if (task) {
      await this.cacheService.invalidateTasks(task.userId);

      await this.notificationService.createJob({
        userId: task.userId,
        title: "Task Deleted",
        content: `Task ${task.title} has been deleted`,
      });
    }

    return task;
  }

  /**
   * Mark task as complete
   */
  async markTaskAsComplete(taskId, userId) {
    const task = await this.taskOps.findById(taskId, userId);
    if (!task) {
      throw new Error("Task not found");
    }

    const updatedTask = await this.taskOps.markComplete(taskId);

    if (updatedTask) {
      await this.cacheService.invalidateTasks(userId);

      await this.notificationService.createJob({
        userId: task.userId,
        title: "Task Updated",
        content: `Task ${task.title} has been marked as complete`,
      });
    }

    return updatedTask;
  }

  /**
   * Mark task as incomplete
   */
  async markTaskAsIncomplete(taskId, userId) {
    const task = await this.taskOps.findById(taskId, userId);
    if (!task) {
      throw new Error("Task not found");
    }

    const updatedTask = await this.taskOps.markIncomplete(taskId);

    if (updatedTask) {
      await this.cacheService.invalidateTasks(userId);

      await this.notificationService.createJob({
        userId: task.userId,
        title: "Task Updated",
        content: `Task ${task.title} has been marked as incomplete`,
      });
    }

    return updatedTask;
  }

  /**
   * Fetch subtasks for a task
   */
  async fetchSubtasks(taskId) {
    return await this.subtaskOps.findByTaskId(taskId);
  }

  /**
   * Fetch notes for a task
   */
  async fetchNotes(taskId) {
    return await this.noteOps.findByTaskId(taskId);
  }

  /**
   * Fetch tasks with no vector embeddings (for migration)
   */
  async fetchTaskWithNoVector() {
    const tasks = await this.taskOps.findWithNoVector();

    await Promise.all(
      tasks.map(async (task) => {
        const embedding = await this.embeddingService.createEmbedding(
          `${task.title} ${task.description}`
        );
        await this.taskOps.update(task.id, task.userId, { vector: embedding });
      })
    );

    return tasks;
  }

  /**
   * Fetch tasks by project ID
   */
  async fetchTasksByProjectId(projectId) {
    return await this.taskOps.findByProjectId(projectId);
  }
}
```

### `packages/task-management/src/services/SubtaskService.js`
```javascript
/**
 * SubtaskService
 * Business logic for subtask management
 */
export class SubtaskService {
  constructor(dependencies) {
    const { subtaskOps } = dependencies;
    if (!subtaskOps) throw new Error('SubtaskOperations is required');
    this.subtaskOps = subtaskOps;
  }

  async createSubtask(subtaskData) {
    return await this.subtaskOps.create(subtaskData);
  }

  async createMultipleSubtasks(subtasksData) {
    return await this.subtaskOps.createMultiple(subtasksData);
  }

  async updateSubtask(subtaskId, updates) {
    return await this.subtaskOps.update(subtaskId, updates);
  }

  async markSubtaskAsComplete(subtaskId) {
    return await this.subtaskOps.markComplete(subtaskId);
  }

  async markSubtaskAsIncomplete(subtaskId) {
    return await this.subtaskOps.markIncomplete(subtaskId);
  }

  async fetchSubtasksByTaskId(taskId) {
    return await this.subtaskOps.findByTaskId(taskId);
  }

  async deleteSubtask(subtaskId) {
    return await this.subtaskOps.delete(subtaskId);
  }
}
```

### `packages/task-management/src/database/TaskOperations.js`
```javascript
/**
 * TaskOperations
 * Database operations for tasks
 * 
 * NOTE: db and schema must be injected - NO direct imports!
 */
export class TaskOperations {
  constructor(dependencies) {
    const { db, schema } = dependencies;
    if (!db) throw new Error('Database connection is required');
    if (!schema) throw new Error('Schema is required');
    if (!schema.tasks) throw new Error('tasks table schema is required');

    this.db = db;
    this.schema = schema;
  }

  async create(taskData) {
    // Import drizzle operators dynamically
    const { eq, and, desc, isNull } = await import('drizzle-orm');

    const [task] = await this.db
      .insert(this.schema.tasks)
      .values({
        ...taskData,
        createdAt: new Date().toISOString(),
        isCompleted: taskData.isCompleted ?? false,
        priority: taskData.priority || "None",
        status: taskData.status || "notStarted",
        position: taskData.position || 1,
      })
      .returning();
    return task;
  }

  async findById(id, userId) {
    const { eq, and } = await import('drizzle-orm');
    const result = await this.db
      .select()
      .from(this.schema.tasks)
      .where(and(eq(this.schema.tasks.id, id), eq(this.schema.tasks.userId, userId)));
    return result[0] || null;
  }

  async findByUserId(userId) {
    const { eq, desc } = await import('drizzle-orm');
    return await this.db
      .select()
      .from(this.schema.tasks)
      .where(eq(this.schema.tasks.userId, userId))
      .orderBy(desc(this.schema.tasks.createdAt));
  }

  async findByProjectId(projectId) {
    const { eq } = await import('drizzle-orm');
    return await this.db
      .select()
      .from(this.schema.tasks)
      .where(eq(this.schema.tasks.projectId, projectId));
  }

  async findWithNoVector() {
    const { isNull } = await import('drizzle-orm');
    return await this.db
      .select()
      .from(this.schema.tasks)
      .where(isNull(this.schema.tasks.vector));
  }

  async update(id, userId, updates) {
    const { eq, and } = await import('drizzle-orm');
    const [task] = await this.db
      .update(this.schema.tasks)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(and(eq(this.schema.tasks.id, id), eq(this.schema.tasks.userId, userId)))
      .returning();
    return task;
  }

  async markComplete(id) {
    const { eq } = await import('drizzle-orm');
    const [task] = await this.db
      .update(this.schema.tasks)
      .set({ isCompleted: true, updatedAt: new Date().toISOString() })
      .where(eq(this.schema.tasks.id, id))
      .returning();
    return task;
  }

  async markIncomplete(id) {
    const { eq } = await import('drizzle-orm');
    const [task] = await this.db
      .update(this.schema.tasks)
      .set({ isCompleted: false, updatedAt: new Date().toISOString() })
      .where(eq(this.schema.tasks.id, id))
      .returning();
    return task;
  }

  async delete(id, userId) {
    const { eq, and } = await import('drizzle-orm');
    const [task] = await this.db
      .delete(this.schema.tasks)
      .where(and(eq(this.schema.tasks.id, id), eq(this.schema.tasks.userId, userId)))
      .returning();
    return task;
  }
}
```

### `packages/task-management/src/database/SubtaskOperations.js`
```javascript
/**
 * SubtaskOperations
 * Database operations for subtasks
 */
export class SubtaskOperations {
  constructor(dependencies) {
    const { db, schema } = dependencies;
    if (!db) throw new Error('Database connection is required');
    if (!schema) throw new Error('Schema is required');
    if (!schema.subtasks) throw new Error('subtasks table schema is required');

    this.db = db;
    this.schema = schema;
  }

  async create(subtaskData) {
    const insertData = {
      taskId: subtaskData.taskId,
      subtaskName: subtaskData.subtaskName,
      isComplete: subtaskData.isComplete ?? false,
    };
    const [subtask] = await this.db
      .insert(this.schema.subtasks)
      .values(insertData)
      .returning();
    return subtask;
  }

  async createMultiple(subtasksData) {
    return await this.db
      .insert(this.schema.subtasks)
      .values(
        subtasksData.map((st) => ({
          ...st,
          createdAt: new Date().toISOString(),
          isComplete: st.isComplete ?? false,
        }))
      )
      .returning();
  }

  async findByTaskId(taskId) {
    const { eq, desc } = await import('drizzle-orm');
    return await this.db
      .select()
      .from(this.schema.subtasks)
      .where(eq(this.schema.subtasks.taskId, taskId))
      .orderBy(desc(this.schema.subtasks.createdAt));
  }

  async update(id, updates) {
    const { eq } = await import('drizzle-orm');
    const [subtask] = await this.db
      .update(this.schema.subtasks)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(eq(this.schema.subtasks.id, id))
      .returning();
    return subtask;
  }

  async markComplete(id) {
    const { eq } = await import('drizzle-orm');
    const [subtask] = await this.db
      .update(this.schema.subtasks)
      .set({ isComplete: true, updatedAt: new Date().toISOString() })
      .where(eq(this.schema.subtasks.id, id))
      .returning();
    return subtask;
  }

  async markIncomplete(id) {
    const { eq } = await import('drizzle-orm');
    const [subtask] = await this.db
      .update(this.schema.subtasks)
      .set({ isComplete: false, updatedAt: new Date().toISOString() })
      .where(eq(this.schema.subtasks.id, id))
      .returning();
    return subtask;
  }

  async delete(id) {
    const { eq } = await import('drizzle-orm');
    const [subtask] = await this.db
      .delete(this.schema.subtasks)
      .where(eq(this.schema.subtasks.id, id))
      .returning();
    return subtask;
  }
}
```

### ❌ Controllers Should NOT Be in Package

**Controllers belong in the application layer (`routes/v1/tasks.js`), not in packages!**

Controllers are HTTP-specific (use `req`/`res`) and should be defined where you handle HTTP routing.

### ❌ Routes Should NOT Be in Package

**Routes belong in the application layer (`routes/v1/tasks.js`), not in packages!**

See usage example below for how to define routes in your application.

## Usage in Your Application

### Initialize Package in `index.js` or setup file
```javascript
import { createTaskManagementModule } from '@taskflow/task-management';
import { db } from './db/index.js';
import * as schema from './db/schema.js';
import { cacheService } from './services/cache.js';
import { createNotificationJob } from './services/jobs.js';
import { EmbeddingService } from './modules/user-context/src/index.js';
import { noteOps } from './db/operations/notes.js';
import { createGoogleGenerativeAI } from "@ai-sdk/google";

// Initialize dependencies
const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_AI_KEY });
const embeddingModel = google.textEmbedding("gemini-embedding-001");
const embeddingService = new EmbeddingService(embeddingModel);

// Create task management module with all dependencies
const taskManagement = createTaskManagementModule({
  db,
  schema,
  cacheService,
  notificationService: { createJob: createNotificationJob },
  embeddingService,
  noteOperations: noteOps,
});

// Define routes in application layer (routes/v1/tasks.js)
// See example below
```

### Define Routes in Application Layer

**`routes/v1/tasks.js`** (Routes belong here!)
```javascript
import express from "express";
import { TaskController } from '@taskflow/task-management';
import { createTaskManagementModule } from '@taskflow/task-management';
import { db } from '../../db/index.js';
import * as schema from '../../db/schema.js';
// ... other dependencies

const router = express.Router();

// Initialize module
const taskManagement = createTaskManagementModule({
  db,
  schema,
  cacheService,
  notificationService,
  embeddingService,
  noteOperations,
});

// Get services from package (NOT controllers!)
const { taskService, subtaskService } = taskManagement.services;

// Controllers defined in application layer (not in package!)
router.post("/create", async (req, res) => {
  try {
    const userId = req.userId;
    const { subtasks, ...taskData } = req.body;
    taskData.userId = userId;

    const task = await taskService.createTask(taskData);

    if (subtasks && subtasks.length > 0) {
      const subtasksWithTaskId = subtasks
        .filter((subtask) => subtask !== "")
        .map((subtask) => ({
          subtask_name: subtask,
          task_id: task.id,
        }));

      if (subtasksWithTaskId.length > 0) {
        await subtaskService.createMultipleSubtasks(subtasksWithTaskId);
      }
    }

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

// ... other routes follow same pattern

export default router;
```

**`routes/v1/index.js`**
```javascript
import express from "express";
import { requireAuth } from "../../middleware/auth.js";
import taskRoutes from "./tasks.js";
import subtaskRoutes from "./subtasks.js";

const router = express.Router();
router.use(requireAuth);

// Mount routes
router.use("/tasks", taskRoutes);
router.use("/subtasks", subtaskRoutes);

export default router;
```

## Key Differences from Module Approach

### 1. **Dependency Injection Required**
```javascript
// Module: Can use direct imports
import { db } from '../../../db/index.js';

// Package: Must inject dependencies
constructor({ db, schema }) {
  this.db = db;  // Injected, not imported
}
```

### 2. **Package Name Imports**
```javascript
// Module: Relative path
import { TaskService } from '../modules/task-management/src/index.js';

// Package: Package name
import { TaskService } from '@taskflow/task-management';
```

### 3. **Own Package.json**
- Has its own dependencies
- Can be versioned independently
- Can be published to npm

### 4. **Factory Pattern**
- Uses factory function to initialize
- All dependencies passed in
- Returns configured module instance

### 5. **No Direct Imports from Parent**
- Cannot import from parent workspace
- All dependencies must be injected
- More explicit dependencies

## Installation & Setup

### 1. Install workspace dependencies
```bash
pnpm install  # or npm install / yarn install
```

### 2. Workspace linking happens automatically
- pnpm/yarn/npm workspaces handle linking
- Package is available via `@taskflow/task-management`

### 3. Version the package
```json
{
  "version": "1.0.0"  // Can version independently
}
```

### 4. Publish to npm (optional)
```bash
cd packages/task-management
npm publish --access public
```

## Key Characteristics of Package Approach

✅ **Versioned**: Can version independently (`1.0.0`, `1.1.0`, etc.)
✅ **Publishable**: Can publish to npm
✅ **Reusable**: Can use in other projects
✅ **Isolated Dependencies**: Own `node_modules`
✅ **Clear Boundaries**: No direct imports from parent
✅ **Dependency Injection**: All dependencies explicit

❌ **More Complex**: Requires workspace setup
❌ **More Setup**: Need to configure workspaces
❌ **Dependency Management**: Must manage dependencies between packages
