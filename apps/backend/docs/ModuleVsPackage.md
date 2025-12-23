# Module vs Separate Package: User Context Management

This document shows the concrete differences between implementing user context management as a **module** (within your workspace) vs a **separate package** (standalone npm/workspace package).

---

## Approach 1: Module (Within Workspace)

A module is a well-organized directory within your existing codebase that acts as a self-contained unit but shares the same `package.json` and dependencies.

### Directory Structure

```
/workspace/
├── modules/
│   └── user-context/              # New module directory
│       ├── src/
│       │   ├── core/
│       │   │   ├── EmbeddingService.js
│       │   │   ├── ContextRetrievalService.js
│       │   │   ├── SummarizationService.js
│       │   │   └── ContextWindowService.js
│       │   ├── jobs/
│       │   │   ├── EmbeddingJob.js
│       │   │   ├── SummarizationJob.js
│       │   │   └── index.js
│       │   ├── database/
│       │   │   └── ContextOperations.js
│       │   ├── utils/
│       │   │   ├── TokenEstimator.js
│       │   │   └── ContextFormatter.js
│       │   └── index.js           # Main export file
│       ├── tests/
│       │   ├── unit/
│       │   └── integration/
│       └── README.md
│
├── services/
│   ├── tasks.js                   # Uses module
│   ├── notes.js                   # Uses module
│   └── ...
├── package.json                    # Shared dependencies
└── index.js
```

### Module Structure Example

**`modules/user-context/src/index.js`** (Main Export)
```javascript
// Main entry point - exports all public APIs
export { EmbeddingService } from './core/EmbeddingService.js';
export { ContextRetrievalService } from './core/ContextRetrievalService.js';
export { SummarizationService } from './core/SummarizationService.js';
export { ContextWindowService } from './core/ContextWindowService.js';
export { createEmbeddingJob, createSummarizationJob } from './jobs/index.js';
export { ContextOperations } from './database/ContextOperations.js';
export { TokenEstimator, ContextFormatter } from './utils/index.js';

// Factory function for dependency injection
export function createUserContextModule(dependencies) {
  const { db, redis, aiProviders } = dependencies;
  
  return {
    embeddingService: new EmbeddingService(aiProviders),
    contextRetrieval: new ContextRetrievalService(db),
    summarization: new SummarizationService(aiProviders),
    // ... etc
  };
}
```

**`modules/user-context/src/core/EmbeddingService.js`**
```javascript
import { embed } from "ai";
import { db } from "../../../db/index.js"; // Relative import to shared DB

export class EmbeddingService {
  constructor(embeddingModel) {
    this.embeddingModel = embeddingModel;
  }

  async createEmbedding(inputData) {
    const { embedding } = await embed({
      model: this.embeddingModel,
      value: inputData,
      providerOptions: {
        google: {
          outputDimensionality: 1536,
          taskType: "SEMANTIC_SIMILARITY",
        },
      },
    });
    return embedding;
  }

  async searchEmbedding(promptEmbedding, userId) {
    const embeddingArray = `[${promptEmbedding.join(",")}]`;
    const sql = (await import("drizzle-orm")).sql;
    
    const tasks = await db.execute(
      sql`SELECT title, description, id FROM tasks 
          WHERE tasks.user_id = ${userId} 
          ORDER BY vector <=> ${embeddingArray}::vector LIMIT 10`
    );
    // ... more queries
    return { tasks, messages, notes };
  }
}
```

**`modules/user-context/src/jobs/index.js`**
```javascript
import { Queue } from "bullmq";
import Redis from "ioredis";
import { initWorkers as initEmbeddingWorkers } from "./EmbeddingJob.js";
import { initWorkers as initSummarizationWorkers } from "./SummarizationJob.js";

// Uses shared Redis connection from services/jobs.js
const connection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const embeddingQueue = new Queue("user-context-embedding", { connection });
const summarizationQueue = new Queue("user-context-summarization", { connection });

export async function createEmbeddingJob(data) {
  await embeddingQueue.add("create-embedding", data);
}

export async function createSummarizationJob(data) {
  await summarizationQueue.add("create-summarization", data);
}

export function initWorkers() {
  initEmbeddingWorkers(connection);
  initSummarizationWorkers(connection);
}
```

### Usage in Your Code

**`services/tasks.js`** (Using the module)
```javascript
import { EmbeddingService } from '../modules/user-context/src/index.js';
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_AI_KEY });
const embeddingModel = google.textEmbedding("gemini-embedding-001");
const embeddingService = new EmbeddingService(embeddingModel);

export const taskService = {
  async createTask(userId, taskData) {
    // Create task
    const task = await taskOps.create({ ...taskData, userId });
    
    // Use module's embedding service
    const embedding = await embeddingService.createEmbedding(
      `${taskData.title} ${taskData.description}`
    );
    
    await taskOps.update(task.id, userId, { vector: embedding });
    return task;
  }
};
```

**`services/jobs.js`** (Integrating module workers)
```javascript
import { initWorkers as initContextWorkers } from '../modules/user-context/src/jobs/index.js';

export const initWorkers = () => {
  // Existing workers
  workers.testWorker = new Worker(/* ... */);
  
  // Add context management workers
  initContextWorkers();
};
```

### Module Characteristics

✅ **Pros:**
- Simple to set up (no separate package.json)
- Direct access to shared dependencies
- Easy refactoring (can move code incrementally)
- No versioning concerns
- Shared TypeScript config (if you add TS)
- Single `node_modules` directory

❌ **Cons:**
- Can't version independently
- Can't publish to npm
- Harder to reuse in other projects
- All dependencies in root package.json

---

## Approach 2: Separate Package (Standalone)

A separate package has its own `package.json`, can be versioned independently, and can be published to npm or used as a workspace package.

### Directory Structure (Workspace Package)

```
/workspace/
├── packages/                       # New packages directory
│   └── user-context/              # Separate package
│       ├── src/
│       │   ├── core/
│       │   ├── jobs/
│       │   ├── database/
│       │   ├── utils/
│       │   └── index.js
│       ├── tests/
│       ├── package.json           # Own package.json!
│       ├── README.md
│       └── tsconfig.json          # Own TypeScript config (optional)
│
├── package.json                    # Root workspace package.json
├── services/
│   ├── tasks.js                   # Imports from package
│   └── ...
└── index.js
```

### Package Structure Example

**`packages/user-context/package.json`**
```json
{
  "name": "@taskflow/user-context",
  "version": "1.0.0",
  "description": "User context management module for Taskflow",
  "type": "module",
  "main": "./src/index.js",
  "exports": {
    ".": "./src/index.js",
    "./core": "./src/core/index.js",
    "./jobs": "./src/jobs/index.js"
  },
  "scripts": {
    "test": "node --test tests/**/*.test.js",
    "lint": "eslint src/**/*.js"
  },
  "dependencies": {
    "@ai-sdk/google": "^2.0.11",
    "@openrouter/ai-sdk-provider": "^1.2.0",
    "ai": "^5.0.60",
    "bullmq": "^5.58.7",
    "drizzle-orm": "^0.44.5",
    "ioredis": "^5.7.0",
    "zod": "^3.25.76"
  },
  "peerDependencies": {
    "postgres": "^3.4.7"
  },
  "devDependencies": {
    "@types/node": "^20.0.0"
  }
}
```

**`packages/user-context/src/index.js`** (Main Export)
```javascript
// Package entry point - clean public API
export { EmbeddingService } from './core/EmbeddingService.js';
export { ContextRetrievalService } from './core/ContextRetrievalService.js';
export { SummarizationService } from './core/SummarizationService.js';
export { ContextWindowService } from './core/ContextWindowService.js';

// Named exports for jobs
export { 
  createEmbeddingJob, 
  createSummarizationJob,
  initWorkers as initContextWorkers 
} from './jobs/index.js';

// Database operations
export { ContextOperations } from './database/ContextOperations.js';

// Utilities
export { TokenEstimator, ContextFormatter } from './utils/index.js';

// Factory for dependency injection
export function createUserContextModule(config) {
  const { db, redis, aiProviders } = config;
  // ... implementation
}
```

**`packages/user-context/src/core/EmbeddingService.js`**
```javascript
import { embed } from "ai";

// NO direct imports from parent workspace!
// Dependencies injected via constructor
export class EmbeddingService {
  constructor(embeddingModel, db) {
    this.embeddingModel = embeddingModel;
    this.db = db; // Database injected as dependency
  }

  async createEmbedding(inputData) {
    const { embedding } = await embed({
      model: this.embeddingModel,
      value: inputData,
      providerOptions: {
        google: {
          outputDimensionality: 1536,
          taskType: "SEMANTIC_SIMILARITY",
        },
      },
    });
    return embedding;
  }

  async searchEmbedding(promptEmbedding, userId) {
    const { sql } = await import("drizzle-orm");
    const embeddingArray = `[${promptEmbedding.join(",")}]`;
    
    // Uses injected db, not direct import
    const tasks = await this.db.execute(
      sql`SELECT title, description, id FROM tasks 
          WHERE tasks.user_id = ${userId} 
          ORDER BY vector <=> ${embeddingArray}::vector LIMIT 10`
    );
    // ... more queries
    return { tasks, messages, notes };
  }
}
```

**`packages/user-context/src/jobs/index.js`**
```javascript
import { Queue } from "bullmq";

// Redis connection must be passed in or created here
export function createQueues(redisConnection) {
  const embeddingQueue = new Queue("user-context-embedding", { 
    connection: redisConnection 
  });
  const summarizationQueue = new Queue("user-context-summarization", { 
    connection: redisConnection 
  });
  
  return { embeddingQueue, summarizationQueue };
}

export async function createEmbeddingJob(queue, data) {
  await queue.add("create-embedding", data);
}

export async function createSummarizationJob(queue, data) {
  await queue.add("create-summarization", data);
}
```

### Root Workspace Configuration

**`package.json`** (Root - Workspace Setup)
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
    // Shared dependencies can stay here
    "express": "^5.1.0",
    "cors": "^2.8.5"
  }
}
```

### Usage in Your Code

**`services/tasks.js`** (Using the package)
```javascript
// Import from package (workspace or npm)
import { EmbeddingService } from '@taskflow/user-context';
// OR if not using workspaces:
// import { EmbeddingService } from '../packages/user-context/src/index.js';

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { db } from '../db/index.js';

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_AI_KEY });
const embeddingModel = google.textEmbedding("gemini-embedding-001");

// Inject dependencies
const embeddingService = new EmbeddingService(embeddingModel, db);

export const taskService = {
  async createTask(userId, taskData) {
    const task = await taskOps.create({ ...taskData, userId });
    
    const embedding = await embeddingService.createEmbedding(
      `${taskData.title} ${taskData.description}`
    );
    
    await taskOps.update(task.id, userId, { vector: embedding });
    return task;
  }
};
```

**`index.js`** (Initializing package)
```javascript
import { initContextWorkers } from '@taskflow/user-context';
import Redis from "ioredis";

const redisConnection = new Redis(process.env.REDIS_URL);

// Initialize package workers
initContextWorkers(redisConnection);
```

### Package Characteristics

✅ **Pros:**
- Versioned independently (`1.0.0`, `1.1.0`, etc.)
- Can publish to npm for reuse
- Clear boundaries and dependencies
- Own test suite and CI/CD
- Can be used in other projects
- Better for large teams (clear ownership)

❌ **Cons:**
- More setup complexity
- Need to manage dependencies between packages
- Versioning overhead
- More complex build/deploy process
- Need workspace tooling (npm/yarn/pnpm workspaces)

---

## Comparison Table

| Aspect | Module | Separate Package |
|--------|--------|------------------|
| **Setup Complexity** | Low | Medium-High |
| **Versioning** | No | Yes |
| **Publish to npm** | No | Yes |
| **Reuse in other projects** | No | Yes |
| **Dependency Management** | Shared | Isolated |
| **Build Process** | Simple | More complex |
| **Testing** | Shared test setup | Own test setup |
| **TypeScript** | Shared config | Own config |
| **Import Path** | `../modules/user-context/src` | `@taskflow/user-context` |
| **Refactoring Ease** | Easy | Medium |
| **Team Ownership** | Unclear | Clear |

---

## Recommendation for Your Project

### Start with **Module** approach because:

1. **Lower Risk**: Easier to refactor incrementally
2. **Faster Setup**: No workspace configuration needed
3. **Simpler**: Direct imports, shared dependencies
4. **Your Current Scale**: Single project, single team

### Migrate to **Package** later if:

1. You need to reuse it in other projects
2. You want to publish to npm
3. Team grows and needs clear boundaries
4. You need independent versioning
5. You want separate CI/CD pipelines

---

## Hybrid Approach (Best of Both Worlds)

You can start as a module and structure it like a package:

```
modules/user-context/
├── src/
├── tests/
├── package.json          # For documentation/metadata only
└── README.md
```

Then migrate to `packages/user-context/` when ready - minimal code changes needed!

---

## Example: Module Implementation

Let me create a concrete example of the module structure you could implement right now.
