# Task Management Module Example

This shows the **Module** approach - a self-contained directory within your workspace.

## Directory Structure

```
/workspace/
├── modules/
│   └── task-management/
│       ├── src/
│       │   ├── services/
│       │   │   ├── TaskService.js          # Business logic
│       │   │   └── SubtaskService.js
│       │   ├── controllers/
│       │   │   ├── TaskController.js       # Request handlers (optional)
│       │   │   └── SubtaskController.js
│       │   ├── database/
│       │   │   ├── TaskOperations.js       # Data access
│       │   │   └── SubtaskOperations.js
│       │   └── index.js                    # Exports services/controllers
│       ├── tests/
│       └── README.md
│
├── routes/                                 # Routes belong here!
│   └── v1/
│       ├── tasks.js                        # Task routes
│       └── subtasks.js                     # Subtask routes
│
├── services/
│   └── tasks.js                      # OLD - will be replaced
├── controllers/
│   └── tasks.js                      # OLD - will be replaced
└── routes/
    └── v1/
        └── tasks.js                  # OLD - will be replaced
```

## Core Implementation Files

### `modules/task-management/src/index.js`
```javascript
/**
 * Task Management Module
 * Main entry point - exports all public APIs
 * 
 * NOTE: Modules export business logic (services/controllers), NOT routes!
 * Routes belong in the application layer (routes/v1/)
 */

// Services (Business Logic)
export { TaskService } from './services/TaskService.js';
export { SubtaskService } from './services/SubtaskService.js';

// Controllers (Request Handlers - Optional convenience layer)
export { TaskController } from './controllers/TaskController.js';
export { SubtaskController } from './controllers/SubtaskController.js';

// Database Operations (Data Access)
export { TaskOperations } from './database/TaskOperations.js';
export { SubtaskOperations } from './database/SubtaskOperations.js';

// ❌ NO ROUTES EXPORTED - Routes belong in routes/v1/tasks.js
```

### `modules/task-management/src/services/TaskService.js`
```javascript
import { TaskOperations } from '../database/TaskOperations.js';
import { SubtaskOperations } from '../database/SubtaskOperations.js';
import { NoteOperations } from '../../../db/operations/notes.js';
import { cacheService } from '../../../services/cache.js';
import { createNotificationJob } from '../../../services/jobs.js';
import { EmbeddingService } from '../../user-context/src/core/EmbeddingService.js';
import { createGoogleGenerativeAI } from "@ai-sdk/google";

// Initialize embedding service (can be injected later)
const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_AI_KEY });
const embeddingModel = google.textEmbedding("gemini-embedding-001");
const embeddingService = new EmbeddingService(embeddingModel);

/**
 * TaskService
 * Business logic for task management
 */
export class TaskService {
  constructor(dependencies = {}) {
    this.taskOps = dependencies.taskOps || new TaskOperations();
    this.subtaskOps = dependencies.subtaskOps || new SubtaskOperations();
    this.noteOps = dependencies.noteOps || NoteOperations;
    this.cacheService = dependencies.cacheService || cacheService;
    this.notificationService = dependencies.notificationService || { createJob: createNotificationJob };
    this.embeddingService = dependencies.embeddingService || embeddingService;
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

### `modules/task-management/src/services/SubtaskService.js`
```javascript
import { SubtaskOperations } from '../database/SubtaskOperations.js';

/**
 * SubtaskService
 * Business logic for subtask management
 */
export class SubtaskService {
  constructor(dependencies = {}) {
    this.subtaskOps = dependencies.subtaskOps || new SubtaskOperations();
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

### `modules/task-management/src/database/TaskOperations.js`
```javascript
import { db } from '../../../db/index.js';
import { tasks } from '../../../db/schema.js';
import { eq, and, desc, isNull } from "drizzle-orm";

/**
 * TaskOperations
 * Database operations for tasks
 */
export class TaskOperations {
  constructor(dependencies = {}) {
    this.db = dependencies.db || db;
    this.schema = dependencies.schema || { tasks };
  }

  async create(taskData) {
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
    const result = await this.db
      .select()
      .from(this.schema.tasks)
      .where(and(eq(this.schema.tasks.id, id), eq(this.schema.tasks.userId, userId)));
    return result[0] || null;
  }

  async findByUserId(userId) {
    return await this.db
      .select()
      .from(this.schema.tasks)
      .where(eq(this.schema.tasks.userId, userId))
      .orderBy(desc(this.schema.tasks.createdAt));
  }

  async findByProjectId(projectId) {
    return await this.db
      .select()
      .from(this.schema.tasks)
      .where(eq(this.schema.tasks.projectId, projectId));
  }

  async findWithNoVector() {
    return await this.db
      .select()
      .from(this.schema.tasks)
      .where(isNull(this.schema.tasks.vector));
  }

  async update(id, userId, updates) {
    const [task] = await this.db
      .update(this.schema.tasks)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(and(eq(this.schema.tasks.id, id), eq(this.schema.tasks.userId, userId)))
      .returning();
    return task;
  }

  async markComplete(id) {
    const [task] = await this.db
      .update(this.schema.tasks)
      .set({ isCompleted: true, updatedAt: new Date().toISOString() })
      .where(eq(this.schema.tasks.id, id))
      .returning();
    return task;
  }

  async markIncomplete(id) {
    const [task] = await this.db
      .update(this.schema.tasks)
      .set({ isCompleted: false, updatedAt: new Date().toISOString() })
      .where(eq(this.schema.tasks.id, id))
      .returning();
    return task;
  }

  async delete(id, userId) {
    const [task] = await this.db
      .delete(this.schema.tasks)
      .where(and(eq(this.schema.tasks.id, id), eq(this.schema.tasks.userId, userId)))
      .returning();
    return task;
  }
}
```

### `modules/task-management/src/database/SubtaskOperations.js`
```javascript
import { db } from '../../../db/index.js';
import { subtasks } from '../../../db/schema.js';
import { eq, desc } from "drizzle-orm";

/**
 * SubtaskOperations
 * Database operations for subtasks
 */
export class SubtaskOperations {
  constructor(dependencies = {}) {
    this.db = dependencies.db || db;
    this.schema = dependencies.schema || { subtasks };
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
    return await this.db
      .select()
      .from(this.schema.subtasks)
      .where(eq(this.schema.subtasks.taskId, taskId))
      .orderBy(desc(this.schema.subtasks.createdAt));
  }

  async update(id, updates) {
    const [subtask] = await this.db
      .update(this.schema.subtasks)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(eq(this.schema.subtasks.id, id))
      .returning();
    return subtask;
  }

  async markComplete(id) {
    const [subtask] = await this.db
      .update(this.schema.subtasks)
      .set({ isComplete: true, updatedAt: new Date().toISOString() })
      .where(eq(this.schema.subtasks.id, id))
      .returning();
    return subtask;
  }

  async markIncomplete(id) {
    const [subtask] = await this.db
      .update(this.schema.subtasks)
      .set({ isComplete: false, updatedAt: new Date().toISOString() })
      .where(eq(this.schema.subtasks.id, id))
      .returning();
    return subtask;
  }

  async delete(id) {
    const [subtask] = await this.db
      .delete(this.schema.subtasks)
      .where(eq(this.schema.subtasks.id, id))
      .returning();
    return subtask;
  }
}
```

### `modules/task-management/src/controllers/TaskController.js`
```javascript
import { TaskService } from '../services/TaskService.js';
import { SubtaskService } from '../services/SubtaskService.js';

/**
 * TaskController
 * HTTP request handlers for tasks
 */
export class TaskController {
  constructor(dependencies = {}) {
    this.taskService = dependencies.taskService || new TaskService();
    this.subtaskService = dependencies.subtaskService || new SubtaskService();
  }

  createTask = async (req, res) => {
    try {
      const userId = req.userId;
      const { subtasks, ...taskData } = req.body;

      taskData.userId = userId;
      const task = await this.taskService.createTask(taskData);

      // Handle subtasks if provided
      if (subtasks && subtasks.length > 0) {
        const subtasksWithTaskId = subtasks
          .filter((subtask) => subtask !== "")
          .map((subtask) => ({
            subtask_name: subtask,
            task_id: task.id,
          }));

        if (subtasksWithTaskId.length > 0) {
          await this.subtaskService.createMultipleSubtasks(subtasksWithTaskId);
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
  };

  fetchTasks = async (req, res) => {
    try {
      const userId = req.userId;
      const tasks = await this.taskService.fetchTasks(userId);
      return res.status(200).json({
        success: true,
        message: "Tasks fetched successfully",
        data: tasks,
      });
    } catch (error) {
      console.error("Fetch tasks error:", error);
      return res.status(500).json({ error: "Failed to fetch tasks" });
    }
  };

  fetchSingleTask = async (req, res) => {
    try {
      const userId = req.userId;
      const { taskId } = req.params;
      const task = await this.taskService.fetchSingleTask(taskId, userId);

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Task fetched successfully",
        data: task,
      });
    } catch (error) {
      console.error("Fetch single task error:", error);
      return res.status(500).json({ error: "Failed to fetch task" });
    }
  };

  updateTask = async (req, res) => {
    try {
      const userId = req.userId;
      const { taskId } = req.params;
      const taskData = req.body;

      const task = await this.taskService.updateTask(taskId, userId, taskData);

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Task updated successfully",
        data: task,
      });
    } catch (error) {
      console.error("Update task error:", error);
      return res.status(500).json({ error: "Failed to update task" });
    }
  };

  deleteTask = async (req, res) => {
    try {
      const userId = req.userId;
      const { taskId } = req.params;

      const task = await this.taskService.deleteTask(taskId, userId);

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Task deleted successfully",
        data: task,
      });
    } catch (error) {
      console.error("Delete task error:", error);
      return res.status(500).json({ error: "Failed to delete task" });
    }
  };

  markTaskAsComplete = async (req, res) => {
    try {
      const userId = req.userId;
      const { taskId } = req.params;

      const task = await this.taskService.markTaskAsComplete(taskId, userId);

      return res.status(200).json({
        success: true,
        message: "Task marked as complete",
        data: task,
      });
    } catch (error) {
      console.error("Mark task complete error:", error);
      return res.status(500).json({
        error: error.message || "Failed to mark task as complete",
      });
    }
  };

  markTaskAsIncomplete = async (req, res) => {
    try {
      const userId = req.userId;
      const { taskId } = req.params;

      const task = await this.taskService.markTaskAsIncomplete(taskId, userId);

      return res.status(200).json({
        success: true,
        message: "Task marked as incomplete",
        data: task,
      });
    } catch (error) {
      console.error("Mark task incomplete error:", error);
      return res.status(500).json({
        error: error.message || "Failed to mark task as incomplete",
      });
    }
  };

  fetchSubtasks = async (req, res) => {
    try {
      const { taskId } = req.params;
      const subtasks = await this.taskService.fetchSubtasks(taskId);

      return res.status(200).json({
        success: true,
        message: "Subtasks fetched successfully",
        data: subtasks,
      });
    } catch (error) {
      console.error("Fetch subtasks error:", error);
      return res.status(500).json({ error: "Failed to fetch subtasks" });
    }
  };

  fetchNotes = async (req, res) => {
    try {
      const { taskId } = req.params;
      const notes = await this.taskService.fetchNotes(taskId);

      return res.status(200).json({
        success: true,
        message: "Notes fetched successfully",
        data: notes,
      });
    } catch (error) {
      console.error("Fetch notes error:", error);
      return res.status(500).json({ error: "Failed to fetch notes" });
    }
  };

  fetchTaskWithNoVector = async (req, res) => {
    try {
      const tasks = await this.taskService.fetchTaskWithNoVector();

      return res.status(200).json({
        success: true,
        message: "Tasks fetched successfully",
        data: tasks,
      });
    } catch (error) {
      console.error("Fetch tasks with no vector error:", error);
      return res.status(500).json({
        error: "Failed to fetch tasks with no vector",
      });
    }
  };

  fetchTasksByProjectId = async (req, res) => {
    try {
      const { projectId } = req.params;
      const tasks = await this.taskService.fetchTasksByProjectId(projectId);

      return res.status(200).json({
        success: true,
        message: "Tasks fetched successfully",
        data: tasks,
      });
    } catch (error) {
      console.error("Fetch tasks by project error:", error);
      return res.status(500).json({ error: "Failed to fetch tasks by project" });
    }
  };
}
```

### `modules/task-management/src/controllers/SubtaskController.js`
```javascript
import { SubtaskService } from '../services/SubtaskService.js';

/**
 * SubtaskController
 * HTTP request handlers for subtasks
 */
export class SubtaskController {
  constructor(dependencies = {}) {
    this.subtaskService = dependencies.subtaskService || new SubtaskService();
  }

  createSubtask = async (req, res) => {
    try {
      const subtaskData = req.body;
      const formattedData = {
        taskId: subtaskData.taskId || subtaskData.task_id,
        subtaskName: subtaskData.subtaskName || subtaskData.subtask_name,
        isComplete: subtaskData.isComplete ?? subtaskData.is_complete ?? false,
      };

      const subtask = await this.subtaskService.createSubtask(formattedData);

      return res.status(201).json({
        success: true,
        message: "Subtask created successfully",
        data: subtask,
      });
    } catch (error) {
      console.error("Create subtask error:", error);
      return res.status(500).json({
        error: "Failed to create subtask",
        details: error.message,
      });
    }
  };

  updateSubtask = async (req, res) => {
    try {
      const { subtaskId } = req.params;
      const subtaskData = req.body;

      const subtask = await this.subtaskService.updateSubtask(subtaskId, subtaskData);

      if (!subtask) {
        return res.status(404).json({ error: "Subtask not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Subtask updated successfully",
        data: subtask,
      });
    } catch (error) {
      console.error("Update subtask error:", error);
      return res.status(500).json({ error: "Failed to update subtask" });
    }
  };

  markSubtaskAsComplete = async (req, res) => {
    try {
      const { subtaskId } = req.params;
      const subtask = await this.subtaskService.markSubtaskAsComplete(subtaskId);

      if (!subtask) {
        return res.status(404).json({ error: "Subtask not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Subtask marked as complete",
        data: subtask,
      });
    } catch (error) {
      console.error("Mark subtask complete error:", error);
      return res.status(500).json({
        error: "Failed to mark subtask as complete",
      });
    }
  };

  markSubtaskAsIncomplete = async (req, res) => {
    try {
      const { subtaskId } = req.params;
      const subtask = await this.subtaskService.markSubtaskAsIncomplete(subtaskId);

      if (!subtask) {
        return res.status(404).json({ error: "Subtask not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Subtask marked as incomplete",
        data: subtask,
      });
    } catch (error) {
      console.error("Mark subtask incomplete error:", error);
      return res.status(500).json({
        error: "Failed to mark subtask as incomplete",
      });
    }
  };

  deleteSubtask = async (req, res) => {
    try {
      const { subtaskId } = req.params;
      const subtask = await this.subtaskService.deleteSubtask(subtaskId);

      if (!subtask) {
        return res.status(404).json({ error: "Subtask not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Subtask deleted successfully",
        data: subtask,
      });
    } catch (error) {
      console.error("Delete subtask error:", error);
      return res.status(500).json({ error: "Failed to delete subtask" });
    }
  };
}
```

### ❌ Routes Should NOT Be in Module

**Routes belong in the application layer, not in modules!**

Routes should be defined in `routes/v1/tasks.js` (see usage example below).

## Usage in Your Application

### Define Routes in Application Layer

**`routes/v1/tasks.js`** (Routes belong here, not in module!)
```javascript
import express from "express";
import { TaskController, SubtaskController } from '../../modules/task-management/src/index.js';
import { TaskService } from '../../modules/task-management/src/index.js';
import { SubtaskService } from '../../modules/task-management/src/index.js';
import { cacheService } from '../../services/cache.js';
import { createNotificationJob } from '../../services/jobs.js';
import { EmbeddingService } from '../../modules/user-context/src/index.js';
import { noteOps } from '../../db/operations/notes.js';
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const router = express.Router();

// Initialize services with dependencies
const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_AI_KEY });
const embeddingModel = google.textEmbedding("gemini-embedding-001");
const embeddingService = new EmbeddingService(embeddingModel);

const taskService = new TaskService({
  taskOps,
  subtaskOps,
  noteOps,
  cacheService,
  notificationService: { createJob: createNotificationJob },
  embeddingService,
});

const subtaskService = new SubtaskService({ subtaskOps });

// Initialize controllers
const taskController = new TaskController({ taskService, subtaskService });
const subtaskController = new SubtaskController({ subtaskService });

// Define routes in application layer
router.get("/user", taskController.fetchTasks);
router.get("/user/:taskId", taskController.fetchSingleTask);
router.get("/subtasks/:taskId", taskController.fetchSubtasks);
router.get("/notes/:taskId", taskController.fetchNotes);
router.get("/no-vector", taskController.fetchTaskWithNoVector);
router.get("/project/:projectId", taskController.fetchTasksByProjectId);
router.post("/create", taskController.createTask);
router.patch("/update/:taskId", taskController.updateTask);
router.patch("/complete/:taskId", taskController.markTaskAsComplete);
router.patch("/incomplete/:taskId", taskController.markTaskAsIncomplete);
router.delete("/delete/:taskId", taskController.deleteTask);

export default router;
```

**`routes/v1/subtasks.js`**
```javascript
import express from "express";
import { SubtaskController } from '../../modules/task-management/src/index.js';
// ... initialize controller

const router = express.Router();

router.post("/create", subtaskController.createSubtask);
router.patch("/update/:subtaskId", subtaskController.updateSubtask);
router.patch("/complete/:subtaskId", subtaskController.markSubtaskAsComplete);
router.patch("/incomplete/:subtaskId", subtaskController.markSubtaskAsIncomplete);
router.delete("/delete/:subtaskId", subtaskController.deleteSubtask);

export default router;
```

**`routes/v1/index.js`**
```javascript
import express from "express";
import { requireAuth } from "../../middleware/auth.js";
import taskRoutes from "./tasks.js";
import subtaskRoutes from "./subtasks.js";
// ... other route imports

const router = express.Router();
router.use(requireAuth);

// Mount routes
router.use("/tasks", taskRoutes);
router.use("/subtasks", subtaskRoutes);
// ... other routes

export default router;
```

## Key Characteristics of Module Approach

✅ **Direct Imports**: Can import from parent workspace (`../../../db/index.js`)
✅ **Shared Dependencies**: Uses root `package.json`
✅ **Simple Setup**: Just create directory structure
✅ **Easy Refactoring**: Can migrate incrementally
✅ **No Versioning**: Changes affect entire codebase immediately

## Migration Path

1. Create `modules/task-management/` directory
2. Move code from `services/tasks.js` → module
3. Move code from `controllers/tasks.js` → module
4. Move code from `db/operations/tasks.js` → module
5. Update imports in routes
6. Test thoroughly
7. Remove old files
