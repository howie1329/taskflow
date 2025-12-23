# Concrete Module Example: User Context Management

This shows a concrete implementation of the module approach you can implement right now.

## Directory Structure

```
/workspace/
├── modules/
│   └── user-context/
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
│       │   └── index.js
│       └── README.md
```

## Core Implementation Files

### `modules/user-context/src/index.js`
```javascript
/**
 * User Context Management Module
 * Main entry point - exports all public APIs
 */

// Core Services
export { EmbeddingService } from './core/EmbeddingService.js';
export { ContextRetrievalService } from './core/ContextRetrievalService.js';
export { SummarizationService } from './core/SummarizationService.js';
export { ContextWindowService } from './core/ContextWindowService.js';

// Jobs
export { 
  createEmbeddingJob, 
  createSummarizationJob,
  initContextWorkers 
} from './jobs/index.js';

// Database Operations
export { ContextOperations } from './database/ContextOperations.js';

// Utilities
export { TokenEstimator, ContextFormatter } from './utils/index.js';
```

### `modules/user-context/src/core/EmbeddingService.js`
```javascript
import { embed } from "ai";
import { sql } from "drizzle-orm";
import { db } from "../../../db/index.js";

/**
 * EmbeddingService
 * Handles creation, storage, and retrieval of embeddings
 */
export class EmbeddingService {
  constructor(embeddingModel) {
    this.embeddingModel = embeddingModel;
  }

  /**
   * Create an embedding for given input data
   */
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

  /**
   * Search for similar content using embeddings
   */
  async searchEmbedding(promptEmbedding, userId) {
    const embeddingArray = `[${promptEmbedding.join(",")}]`;

    const tasks = await db.execute(
      sql`SELECT title, description, id FROM tasks 
          WHERE tasks.user_id = ${userId} 
          ORDER BY vector <=> ${embeddingArray}::vector LIMIT 10`
    );

    const messages = await db.execute(
      sql`SELECT content, id FROM messages 
          WHERE messages.user_id = ${userId} 
          AND messages.vectors != null 
          ORDER BY vectors <=> ${embeddingArray}::vector LIMIT 5`
    );

    const notes = await db.execute(
      sql`SELECT blocks, title, description, id FROM notes 
          WHERE notes.user_id = ${userId} 
          AND notes.vector != null 
          ORDER BY vector <=> ${embeddingArray}::vector LIMIT 5`
    );

    return { tasks, messages, notes };
  }

  /**
   * Format search results for AI consumption
   */
  formatSearchResults(searchResults) {
    const { tasks, messages, notes } = searchResults;
    const formattedTasks = [];
    const formattedMessages = [];
    const formattedNotes = [];

    tasks.forEach((result, index) => {
      formattedTasks.push(
        `${index + 1}. ID: ${result.id} ${result.title}: ${result.description}`
      );
    });

    messages.forEach((result, index) => {
      formattedMessages.push(
        `${index + 1}. ID: ${result.id} Content: ${result.content}`
      );
    });

    notes.forEach((result, index) => {
      formattedNotes.push(
        `${index + 1}. ID: ${result.id} Title: ${result.title} Description: ${result.description}`
      );
    });

    return {
      tasks: formattedTasks,
      messages: formattedMessages,
      notes: formattedNotes,
    };
  }
}
```

### `modules/user-context/src/core/ContextRetrievalService.js`
```javascript
import { EmbeddingService } from './EmbeddingService.js';
import { aiChatService } from '../../../services/ai.js';
import { createDecidingModelPrompt } from '../../../utils/AIPrompts/AiDecidingModelPrompt.js';

/**
 * ContextRetrievalService
 * Retrieves relevant context for user queries
 */
export class ContextRetrievalService {
  constructor(embeddingService, aiService) {
    this.embeddingService = embeddingService;
    this.aiService = aiService;
  }

  /**
   * Get smart context for a user message
   */
  async getSmartContext(message, userId) {
    try {
      // Create embedding for the message
      const promptEmbedding = await this.embeddingService.createEmbedding(message);
      
      // Search for similar content
      const searchResults = await this.embeddingService.searchEmbedding(
        promptEmbedding,
        userId
      );
      
      // Format results
      const formattedResults = this.embeddingService.formatSearchResults(searchResults);
      
      // Use AI to decide on relevant context
      const decidingModel = await this.aiService.decidingModel(
        formattedResults,
        message,
        message
      );
      
      return decidingModel.relatedContext;
    } catch (error) {
      console.error("Smart context error:", error);
      throw error;
    }
  }
}
```

### `modules/user-context/src/core/SummarizationService.js`
```javascript
import { conversationService } from '../../../services/conversations.js';
import { createAiSummarizationJob } from '../jobs/index.js';

/**
 * SummarizationService
 * Handles conversation summarization logic
 */
export class SummarizationService {
  constructor(conversationService, jobService) {
    this.conversationService = conversationService;
    this.jobService = jobService;
  }

  /**
   * Summarize conversation if needed
   */
  async summarizeConversation(
    formattedConversationHistory,
    userId,
    conversationId,
    conversationSummary
  ) {
    try {
      const threshold = { K: 1, T: 300, COOLDOWN: 5 };
      
      const lastSummarizedIndex = Number(
        formattedConversationHistory.count || 0
      );
      const totalMessages = formattedConversationHistory.length || 1;
      const deltaMessages =
        lastSummarizedIndex > 0
          ? formattedConversationHistory.slice(lastSummarizedIndex)
          : formattedConversationHistory;
      
      const estimatedTokensSince =
        this.conversationService.estimateTokens(deltaMessages);
      
      const shouldSummarize = this.conversationService.shouldSummarize(
        totalMessages,
        lastSummarizedIndex,
        estimatedTokensSince,
        threshold
      );

      if (shouldSummarize && deltaMessages.length > 0) {
        await this.jobService.createAiSummarizationJob({
          deltaMessages,
          pastSummaries: conversationSummary || "",
          totalMessages,
          conversationId,
          userId,
        });
      }
      
      return conversationSummary;
    } catch (error) {
      console.error("Summary conversation error:", error);
      throw error;
    }
  }
}
```

### `modules/user-context/src/core/ContextWindowService.js`
```javascript
/**
 * ContextWindowService
 * Manages context windowing for conversations
 */
export class ContextWindowService {
  /**
   * Get context window of recent messages
   */
  getContextWindow(contextWindowSize = 3, formattedConversationHistory) {
    return formattedConversationHistory.slice(-contextWindowSize);
  }

  /**
   * Get context window with summary
   */
  getContextWindowWithSummary(
    contextWindowSize,
    formattedConversationHistory,
    summary
  ) {
    const recentMessages = this.getContextWindow(
      contextWindowSize,
      formattedConversationHistory
    );
    
    return {
      summary,
      recentMessages,
    };
  }
}
```

### `modules/user-context/src/utils/TokenEstimator.js`
```javascript
/**
 * TokenEstimator
 * Estimates token counts for messages
 */
export class TokenEstimator {
  /**
   * Estimate tokens in messages
   */
  estimateTokens(messages) {
    try {
      return Math.ceil(
        messages
          .map((message) => message.content || message.parts?.[0]?.text || "")
          .join(" ")
          .split(/\s+/).length * 1.3
      );
    } catch (error) {
      console.error("Error estimating tokens:", error);
      return 0;
    }
  }

  /**
   * Check if summarization threshold is met
   */
  shouldSummarize(
    totalMessages,
    lastSummarizedIndex,
    estimatedTokensSince,
    threshold = { K: 14, T: 2500, COOLDOWN: 6 }
  ) {
    const messageSince = totalMessages - (lastSummarizedIndex || 0);
    const passedThreshold =
      messageSince >= threshold.K || estimatedTokensSince >= threshold.T;
    const passedCooldown = messageSince >= threshold.COOLDOWN;
    return passedThreshold && passedCooldown;
  }
}
```

### `modules/user-context/src/utils/ContextFormatter.js`
```javascript
/**
 * ContextFormatter
 * Formats context for AI consumption
 */
export class ContextFormatter {
  /**
   * Format context for AI prompt
   */
  formatContextForPrompt(context) {
    if (!context || context.length === 0) {
      return "No relevant context found.";
    }

    return context
      .map((item, index) => {
        return `${index + 1}. ${item.title || item.id}: ${item.description || item.content}`;
      })
      .join("\n");
  }

  /**
   * Format conversation history
   */
  formatConversationHistory(conversationHistory) {
    return conversationHistory.map((message) => ({
      role: message.role,
      content: message.content,
      ui: message.ui || {},
      metadata: message.metadata || {},
    }));
  }
}
```

### `modules/user-context/src/database/ContextOperations.js`
```javascript
import { messageOps } from '../../../db/operations/messages.js';
import { conversationOps } from '../../../db/operations/conversations.js';

/**
 * ContextOperations
 * Database operations for context-related data
 */
export class ContextOperations {
  /**
   * Update message embedding
   */
  async updateMessageEmbedding(id, conversationId, userId, vectors) {
    return await messageOps.updateEmbedding(id, conversationId, userId, vectors);
  }

  /**
   * Update conversation summary
   */
  async updateConversationSummary(id, userId, summary, count, title) {
    return await conversationOps.updateSummary(id, userId, summary, count, title);
  }
}
```

### `modules/user-context/src/jobs/index.js`
```javascript
import { Queue, Worker } from "bullmq";
import Redis from "ioredis";
import { conversationOps } from '../../../db/operations/conversations.js';
import { messageOps } from '../../../db/operations/messages.js';
import { aiChatService } from '../../../services/ai.js';
import { embeddingService } from '../../../services/ai.js';
import { convertToModelMessages } from "ai";

const connection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const embeddingQueue = new Queue("user-context-embedding", { connection });
const summarizationQueue = new Queue("user-context-summarization", { connection });

/**
 * Create embedding job
 */
export async function createEmbeddingJob(data) {
  await embeddingQueue.add("create-embedding", data);
}

/**
 * Create summarization job
 */
export async function createSummarizationJob(data) {
  await summarizationQueue.add("create-summarization", data);
}

/**
 * Initialize background workers
 */
export function initContextWorkers() {
  // Embedding Worker
  new Worker(
    "user-context-embedding",
    async (job) => {
      const { aiMessageResponse, conversationId, userId, messageId } = job.data;
      try {
        const vectors = await embeddingService.createEmbedding(aiMessageResponse);
        await messageOps.updateEmbedding(messageId, conversationId, userId, vectors);
        return { success: true, conversationId };
      } catch (error) {
        console.error("Error in embedding worker:", error);
        return { success: false, conversationId, error: error.message };
      }
    },
    { connection }
  );

  // Summarization Worker
  new Worker(
    "user-context-summarization",
    async (job) => {
      const { deltaMessages, pastSummaries, totalMessages, conversationId, userId } = job.data;
      try {
        const transformedMessages = convertToModelMessages(deltaMessages);
        const formattedMessages = transformedMessages.map((message) => ({
          role: message.role,
          content: message.content,
        }));
        
        const deltaSummary = await aiChatService.summarization(
          formattedMessages,
          pastSummaries
        );
        
        const title = await aiChatService.titleConversation(
          deltaSummary,
          formattedMessages
        );
        
        await conversationOps.updateSummary(
          conversationId,
          userId,
          deltaSummary,
          totalMessages,
          title
        );
        
        return { success: true, conversationId, summaryLength: deltaSummary.length };
      } catch (error) {
        console.error("Error in summarization worker:", error);
        throw error;
      }
    },
    { connection }
  );
}
```

## Usage Examples

### In `services/tasks.js`
```javascript
import { EmbeddingService } from '../modules/user-context/src/index.js';
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_AI_KEY });
const embeddingModel = google.textEmbedding("gemini-embedding-001");
const embeddingService = new EmbeddingService(embeddingModel);

export const taskService = {
  async createTask(userId, taskData) {
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

### In `controllers/conversations.js`
```javascript
import { 
  ContextRetrievalService, 
  SummarizationService,
  ContextWindowService 
} from '../modules/user-context/src/index.js';
import { embeddingService, aiChatService } from '../services/ai.js';
import { conversationService } from '../services/conversations.js';

// Initialize services
const contextRetrieval = new ContextRetrievalService(embeddingService, aiChatService);
const summarization = new SummarizationService(conversationService, { createAiSummarizationJob });
const contextWindow = new ContextWindowService();

export const sendMessage = async (req, res) => {
  const userId = req.userId;
  const { messages } = req.body;
  const message = messages[messages.length - 1];
  const settings = messages[messages.length - 1].metadata;

  const conversationId = await conversationService.ensureConversationExists(
    userId,
    id,
    message
  );

  // Get smart context if enabled
  let relatedContext = null;
  if (settings?.isSmartContext) {
    relatedContext = await contextRetrieval.getSmartContext(
      message.parts[0].text,
      userId
    );
  }

  // Get conversation history
  const formattedConversationHistory =
    await conversationService.formattedConversationHistory(
      userId,
      conversationId
    );

  // Summarize if needed
  const conversation = await conversationService.fetchConversation(
    userId,
    conversationId
  );
  const conversationSummary = await summarization.summarizeConversation(
    formattedConversationHistory,
    userId,
    conversationId,
    conversation.summary || ""
  );

  // Get context window
  const contextMessages = contextWindow.getContextWindow(
    settings?.contextWindow || 4,
    formattedConversationHistory
  );

  // Continue with AI response...
};
```

### In `index.js` (Initialize workers)
```javascript
import { initContextWorkers } from './modules/user-context/src/jobs/index.js';

httpServer.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  initWorkers();
  initContextWorkers(); // Add context workers
  startNotificationCleanupCron();
  cleanupPastJobs();
});
```

## Migration Path

1. **Create module directory structure**
2. **Move embedding logic** from `services/ai.js` → `modules/user-context/src/core/EmbeddingService.js`
3. **Move smart context** from `services/chat/SmartContextService.js` → `modules/user-context/src/core/ContextRetrievalService.js`
4. **Move summarization** from `services/chat/SummaryService.js` → `modules/user-context/src/core/SummarizationService.js`
5. **Move jobs** from `services/jobs.js` → `modules/user-context/src/jobs/`
6. **Update imports** across codebase
7. **Test thoroughly**

This module approach gives you all the benefits of organization without the complexity of a separate package!
