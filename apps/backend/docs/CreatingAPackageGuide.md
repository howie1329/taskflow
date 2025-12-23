# Step-by-Step Guide: Creating a Package

Complete guide for creating a package from scratch.

---

## Prerequisites

- Node.js installed
- Package manager: npm, yarn, or pnpm
- Existing workspace/project

---

## Step 1: Create Package Directory Structure

```bash
# Navigate to your workspace root
cd /workspace

# Create packages directory (if it doesn't exist)
mkdir -p packages

# Create your package directory
mkdir -p packages/task-management/src/{services,database,utils}

# Create additional files
touch packages/task-management/README.md
touch packages/task-management/.gitignore
```

**Result:**
```
packages/
└── task-management/
    ├── src/
    │   ├── services/
    │   ├── database/
    │   └── utils/
    ├── README.md
    └── .gitignore
```

---

## Step 2: Create package.json

**`packages/task-management/package.json`**

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
    "./database": "./src/database/index.js"
  },
  "scripts": {
    "test": "node --test tests/**/*.test.js",
    "lint": "eslint src/**/*.js"
  },
  "keywords": [
    "task",
    "management",
    "taskflow"
  ],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "drizzle-orm": "^0.44.5"
  },
  "peerDependencies": {
    "express": "^5.1.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0"
  }
}
```

**Key fields explained:**
- `name`: Package name (scoped with `@taskflow/`)
- `version`: Semantic versioning (`1.0.0`)
- `main`: Entry point file
- `exports`: Modern package exports (allows subpath imports)
- `dependencies`: Required dependencies
- `peerDependencies`: Dependencies expected from parent (Express)

---

## Step 3: Configure Workspace (Root package.json)

**Update root `package.json`:**

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
    "cors": "^2.8.5"
  }
}
```

**Key addition:**
```json
"workspaces": [
  "packages/*"
]
```

**For pnpm, create `pnpm-workspace.yaml`:**
```yaml
packages:
  - 'packages/*'
```

---

## Step 4: Create Core Package Files

### 4.1 Create Service File

**`packages/task-management/src/services/TaskService.js`**

```javascript
/**
 * TaskService
 * Business logic for task management
 */
export class TaskService {
  constructor(dependencies) {
    const {
      taskOps,
      cacheService,
      notificationService,
      embeddingService,
    } = dependencies;

    // Validate required dependencies
    if (!taskOps) throw new Error('TaskOperations is required');
    if (!cacheService) throw new Error('CacheService is required');
    if (!notificationService) throw new Error('NotificationService is required');
    if (!embeddingService) throw new Error('EmbeddingService is required');

    this.taskOps = taskOps;
    this.cacheService = cacheService;
    this.notificationService = notificationService;
    this.embeddingService = embeddingService;
  }

  async createTask(taskData) {
    // Create embedding
    const embedding = await this.embeddingService.createEmbedding(
      `${taskData.title} ${taskData.description}`
    );
    taskData.vector = embedding;

    // Create task
    const task = await this.taskOps.create(taskData);

    // Invalidate cache
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

  async fetchSingleTask(taskId, userId) {
    return await this.taskOps.findById(taskId, userId);
  }

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
}
```

### 4.2 Create Database Operations File

**`packages/task-management/src/database/TaskOperations.js`**

```javascript
/**
 * TaskOperations
 * Database operations for tasks
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

  async update(id, userId, updates) {
    const { eq, and } = await import('drizzle-orm');
    const [task] = await this.db
      .update(this.schema.tasks)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(and(eq(this.schema.tasks.id, id), eq(this.schema.tasks.userId, userId)))
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

### 4.3 Create Index File (Main Export)

**`packages/task-management/src/index.js`**

```javascript
/**
 * Task Management Package
 * Main entry point - exports all public APIs
 */

// Services (Business Logic)
export { TaskService } from './services/TaskService.js';
export { SubtaskService } from './services/SubtaskService.js';

// Database Operations (Data Access)
export { TaskOperations } from './database/TaskOperations.js';
export { SubtaskOperations } from './database/SubtaskOperations.js';

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

  // Validate required config
  if (!db) throw new Error('Database connection (db) is required');
  if (!schema) throw new Error('Schema is required');
  if (!cacheService) throw new Error('CacheService is required');
  if (!notificationService) throw new Error('NotificationService is required');
  if (!embeddingService) throw new Error('EmbeddingService is required');

  // Initialize operations
  const taskOps = new TaskOperations({ db, schema });
  const subtaskOps = new SubtaskOperations({ db, schema });

  // Initialize services
  const taskService = new TaskService({
    taskOps,
    cacheService,
    notificationService,
    embeddingService,
  });

  const subtaskService = new SubtaskService({
    subtaskOps,
  });

  return {
    services: {
      taskService,
      subtaskService,
    },
    operations: {
      taskOps,
      subtaskOps,
    },
  };
}
```

---

## Step 5: Create Supporting Files

### 5.1 Create README.md

**`packages/task-management/README.md`**

```markdown
# @taskflow/task-management

Task and subtask management module for Taskflow.

## Installation

```bash
npm install @taskflow/task-management
```

## Usage

```javascript
import { createTaskManagementModule } from '@taskflow/task-management';
import { db } from './db/index.js';
import * as schema from './db/schema.js';

// Initialize module with dependencies
const taskManagement = createTaskManagementModule({
  db,
  schema,
  cacheService,
  notificationService,
  embeddingService,
});

// Use services
const { taskService } = taskManagement.services;
const task = await taskService.createTask(taskData);
```

## API

### TaskService

- `createTask(taskData)` - Create a new task
- `fetchTasks(userId)` - Fetch all tasks for a user
- `fetchSingleTask(taskId, userId)` - Fetch a single task
- `updateTask(taskId, userId, updates)` - Update a task
- `deleteTask(taskId, userId)` - Delete a task

## Dependencies

- drizzle-orm
- Database connection (injected)
- Cache service (injected)
- Notification service (injected)
- Embedding service (injected)

## License

ISC
```

### 5.2 Create .gitignore

**`packages/task-management/.gitignore`**

```
node_modules/
*.log
.DS_Store
dist/
coverage/
```

---

## Step 6: Install Dependencies

```bash
# From workspace root
npm install

# Or with pnpm
pnpm install

# Or with yarn
yarn install
```

This will:
- Install root dependencies
- Install package dependencies
- Link packages via workspace

---

## Step 7: Create Routes in Application Layer

**`routes/v1/tasks.js`**

```javascript
import express from "express";
import { createTaskManagementModule } from '@taskflow/task-management';
import { db } from '../../db/index.js';
import * as schema from '../../db/schema.js';
import { cacheService } from '../../services/cache.js';
import { createNotificationJob } from '../../services/jobs.js';
import { EmbeddingService } from '../../modules/user-context/src/index.js';
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const router = express.Router();

// Initialize dependencies
const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_AI_KEY });
const embeddingModel = google.textEmbedding("gemini-embedding-001");
const embeddingService = new EmbeddingService(embeddingModel);

// Initialize package module
const taskManagement = createTaskManagementModule({
  db,
  schema,
  cacheService,
  notificationService: { createJob: createNotificationJob },
  embeddingService,
});

// Get services from package
const { taskService } = taskManagement.services;

// Define routes (controllers in application layer)
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

router.get("/user/:taskId", async (req, res) => {
  try {
    const task = await taskService.fetchSingleTask(
      req.params.taskId,
      req.userId
    );
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
});

router.patch("/update/:taskId", async (req, res) => {
  try {
    const task = await taskService.updateTask(
      req.params.taskId,
      req.userId,
      req.body
    );
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
});

router.delete("/delete/:taskId", async (req, res) => {
  try {
    const task = await taskService.deleteTask(
      req.params.taskId,
      req.userId
    );
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
});

export default router;
```

---

## Step 8: Mount Routes

**`routes/v1/index.js`**

```javascript
import express from "express";
import { requireAuth } from "../../middleware/auth.js";
import taskRoutes from "./tasks.js";
// ... other route imports

const router = express.Router();
router.use(requireAuth);

// Mount task routes
router.use("/tasks", taskRoutes);

export default router;
```

---

## Step 9: Test the Package

### 9.1 Create Test File

**`packages/task-management/tests/TaskService.test.js`**

```javascript
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { TaskService } from '../src/services/TaskService.js';

describe('TaskService', () => {
  it('should create a task', async () => {
    // Mock dependencies
    const mockTaskOps = {
      create: async (data) => ({ id: '1', ...data }),
    };
    const mockCacheService = {
      invalidateTasks: async () => {},
      status: async () => true,
      fetchTasks: async () => [],
      addTasks: async () => {},
    };
    const mockNotificationService = {
      createJob: async () => {},
    };
    const mockEmbeddingService = {
      createEmbedding: async () => [0.1, 0.2, 0.3],
    };

    const taskService = new TaskService({
      taskOps: mockTaskOps,
      cacheService: mockCacheService,
      notificationService: mockNotificationService,
      embeddingService: mockEmbeddingService,
    });

    const task = await taskService.createTask({
      title: 'Test Task',
      description: 'Test Description',
      userId: 'user123',
    });

    assert.ok(task);
    assert.equal(task.title, 'Test Task');
  });
});
```

### 9.2 Run Tests

```bash
cd packages/task-management
npm test
```

---

## Step 10: Verify Package Works

### 10.1 Check Package Linking

```bash
# From workspace root
npm list @taskflow/task-management
```

Should show the package is linked.

### 10.2 Test Import

```javascript
// Test file
import { TaskService } from '@taskflow/task-management';
console.log('Package imported successfully!');
```

---

## Step 11: Optional - Add TypeScript Support

### 11.1 Create tsconfig.json

**`packages/task-management/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "tests"]
}
```

### 11.2 Update package.json

```json
{
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build"
  }
}
```

---

## Step 12: Version and Publish (Optional)

### 12.1 Update Version

```bash
cd packages/task-management
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.1 -> 1.1.0
npm version major  # 1.1.0 -> 2.0.0
```

### 12.2 Publish to npm (if desired)

```bash
cd packages/task-management
npm publish --access public
```

---

## Checklist

- [ ] Created package directory structure
- [ ] Created `package.json` with proper name and exports
- [ ] Configured workspace in root `package.json`
- [ ] Created service files (business logic)
- [ ] Created database operation files (data access)
- [ ] Created `index.js` with exports
- [ ] Created `README.md` documentation
- [ ] Created `.gitignore`
- [ ] Installed dependencies (`npm install`)
- [ ] Created routes in application layer
- [ ] Tested package import
- [ ] Verified package works

---

## Common Issues & Solutions

### Issue: Package not found
**Solution:** Run `npm install` from workspace root to link packages

### Issue: Import errors
**Solution:** Check `package.json` exports field and file paths

### Issue: Dependency injection errors
**Solution:** Ensure all required dependencies are passed to factory function

### Issue: Workspace not linking
**Solution:** Verify `workspaces` field in root `package.json`

---

## Next Steps

1. Add more services to the package
2. Add tests
3. Add TypeScript support
4. Document API
5. Version and publish (if needed)

---

## Summary

Creating a package involves:
1. ✅ Create directory structure
2. ✅ Create `package.json`
3. ✅ Configure workspace
4. ✅ Write business logic (services)
5. ✅ Write data access (database operations)
6. ✅ Export from `index.js`
7. ✅ Install dependencies
8. ✅ Use in application layer (routes)
9. ✅ Test
10. ✅ Document

**Packages export services, application layer handles HTTP!** 🎯
