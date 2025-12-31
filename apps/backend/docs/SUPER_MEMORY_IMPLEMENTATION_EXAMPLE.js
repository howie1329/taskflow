/**
 * Super Memory Implementation Example
 * 
 * This file shows how to implement super memory following your existing patterns:
 * 1. Background jobs for storage (like summarization)
 * 2. Tools for explicit operations (like create task)
 * 3. Fast synchronous retrieval (like context search)
 */

// ============================================================================
// 1. ADD MEMORY QUEUE (services/bullmq/queues.js)
// ============================================================================

import { Queue } from "bullmq";
import Redis from "ioredis";

const redisConnection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

// Existing queues...
const summarizationQueue = new Queue("MessageSummarizationQueue", {
  connection: redisConnection,
});

// NEW: Memory Storage Queue
const memoryStorageQueue = new Queue("MemoryStorageQueue", {
  connection: redisConnection,
});

// Existing job creators...
export const addMessageSummarizationJob = async (data) => {
  await summarizationQueue.add("MessageSummarizationJob", data);
};

// NEW: Memory Storage Job Creator
export const addMemoryStorageJob = async (data) => {
  console.log("Adding Memory Storage Job to the Queue");
  await memoryStorageQueue.add("MemoryStorageJob", data);
  console.log("Memory Storage Job Added to the Queue");
};

export {
  summarizationQueue,
  memoryStorageQueue,
  addMessageSummarizationJob,
  addMemoryStorageJob,
  redisConnection,
};

// ============================================================================
// 2. ADD MEMORY WORKER (services/bullmq/jobs.js)
// ============================================================================

import { Worker } from "bullmq";
import { redisConnection } from "./queues.js";
import { embeddingService } from "../ai.js";
// import { memoryOps } from "../../db/operations/memories.js"; // You'll need to create this

// Existing workers...
const messageSummarizationWorker = new Worker(
  "MessageSummarizationQueue",
  async (job) => {
    // ... existing summarization logic
  },
  { connection: redisConnection }
);

// NEW: Memory Storage Worker
const memoryStorageWorker = new Worker(
  "MemoryStorageQueue",
  async (job) => {
    const { userId, fact, category, importance, conversationId, metadata } = job.data;
    
    try {
      console.log("Processing memory storage job:", { userId, fact, category });
      
      // 1. Create embedding for the memory (for retrieval)
      const embedding = await embeddingService.embeddingPrompt(fact);
      
      // 2. Store in database
      // const memory = await memoryOps.create({
      //   userId,
      //   fact,
      //   category: category || "general",
      //   importance: importance || "medium",
      //   embedding,
      //   conversationId,
      //   metadata: metadata || {},
      // });
      
      // 3. Index for fast retrieval (if using vector DB)
      // await memoryOps.indexEmbedding(memory.id, embedding);
      
      console.log("Memory stored successfully");
      return { success: true, memoryId: "memory.id" };
    } catch (error) {
      console.error("Error in memory storage worker:", error);
      throw error;
    }
  },
  { connection: redisConnection }
);

export { messageSummarizationWorker, memoryStorageWorker };

// ============================================================================
// 3. ADD MEMORY SERVICE (services/memory.js)
// ============================================================================

// import { memoryOps } from "../db/operations/memories.js";
import { embeddingService } from "./ai.js";

export const memoryService = {
  /**
   * Store a memory (queues background job - doesn't block)
   */
  async storeMemory(userId, fact, options = {}) {
    const { category, importance, conversationId, metadata } = options;
    
    // Queue background job - doesn't block!
    await addMemoryStorageJob({
      userId,
      fact,
      category: category || "general",
      importance: importance || "medium",
      conversationId,
      metadata: metadata || {},
    });
    
    return { success: true, message: "Memory will be stored" };
  },

  /**
   * Retrieve relevant memories (synchronous - fast vector search)
   */
  async retrieveRelevantMemories(userId, query, options = {}) {
    const { limit = 5, category, conversationId } = options;
    
    try {
      // 1. Create embedding for query
      const queryEmbedding = await embeddingService.embeddingPrompt(query);
      
      // 2. Search similar memories (vector search - fast!)
      // const memories = await memoryOps.searchByEmbedding(
      //   userId,
      //   queryEmbedding,
      //   { limit, category, conversationId }
      // );
      
      // For now, return empty array (implement DB operations)
      return [];
    } catch (error) {
      console.error("Error retrieving memories:", error);
      return [];
    }
  },

  /**
   * Get all memories for a user
   */
  async getUserMemories(userId, options = {}) {
    const { category, limit = 50 } = options;
    // return await memoryOps.findByUserId(userId, { category, limit });
    return [];
  },

  /**
   * Delete a memory
   */
  async deleteMemory(userId, memoryId) {
    // return await memoryOps.delete(memoryId, userId);
    return { success: true };
  },
};

// ============================================================================
// 4. ADD MEMORY TOOLS (utils/AiTools/VercelAITools.js)
// ============================================================================

import { tool } from "ai";
import { z } from "zod";
import { memoryService } from "../../services/memory.js";
import { ArtifactWriter } from "./ArtifactHelpers.js";

export const VercelAITools = (writer, artifactsCollector = null, userId = null) => {
  // ... existing tools (GetTasks, CreateTask, etc.)
  
  return {
    // ... existing tools
    
    /**
     * Remember a fact about the user
     * This queues a background job - doesn't block the agent!
     */
    RememberFact: new tool({
      name: "RememberFact",
      description: "Store a fact, preference, or context about the user for future conversations. Use this when the user shares personal information, preferences, or context that should be remembered.",
      inputSchema: z.object({
        fact: z.string().describe("The fact, preference, or context to remember"),
        category: z.enum(["preference", "fact", "context", "goal", "constraint", "other"])
          .optional()
          .describe("Category of the memory"),
        importance: z.enum(["low", "medium", "high"])
          .optional()
          .describe("How important this memory is"),
      }),
      execute: async ({ fact, category, importance }) => {
        const artifact = new ArtifactWriter(
          writer,
          "RememberFact",
          artifactsCollector
        );
        const input = { fact, category, importance };

        try {
          artifact.loading(input, "Storing memory...");

          // Queue background job - doesn't block!
          await memoryService.storeMemory(userId, fact, {
            category: category || "general",
            importance: importance || "medium",
          });

          artifact.complete(
            input,
            { success: true, fact },
            "I'll remember that for future conversations"
          );

          return {
            success: true,
            message: "I've stored that information for future conversations.",
          };
        } catch (error) {
          artifact.error(input, error, "Failed to store memory");
          throw error;
        }
      },
    }),

    /**
     * Retrieve stored memories
     * This is synchronous but fast (vector search)
     */
    RetrieveMemory: new tool({
      name: "RetrieveMemory",
      description: "Search and retrieve stored memories about the user. Use this when you need to recall past information, preferences, or context.",
      inputSchema: z.object({
        query: z.string().describe("What to search for in stored memories"),
        category: z.string().optional().describe("Filter by category if needed"),
      }),
      execute: async ({ query, category }) => {
        const artifact = new ArtifactWriter(
          writer,
          "RetrieveMemory",
          artifactsCollector
        );
        const input = { query, category };

        try {
          artifact.loading(input, "Searching memories...");

          // Fast synchronous search
          const memories = await memoryService.retrieveRelevantMemories(
            userId,
            query,
            { category, limit: 10 }
          );

          artifact.complete(
            input,
            { memories, count: memories.length },
            `Found ${memories.length} relevant memory${memories.length !== 1 ? "ies" : ""}`
          );

          return {
            memories: memories.map((m) => ({
              fact: m.fact,
              category: m.category,
              importance: m.importance,
              createdAt: m.createdAt,
            })),
            count: memories.length,
          };
        } catch (error) {
          artifact.error(input, error, "Failed to retrieve memories");
          throw error;
        }
      },
    }),

    /**
     * List all stored memories
     */
    ListMemories: new tool({
      name: "ListMemories",
      description: "List all stored memories for the user, optionally filtered by category.",
      inputSchema: z.object({
        category: z.string().optional().describe("Filter by category"),
        limit: z.number().optional().describe("Maximum number of memories to return"),
      }),
      execute: async ({ category, limit }) => {
        const artifact = new ArtifactWriter(
          writer,
          "ListMemories",
          artifactsCollector
        );
        const input = { category, limit };

        try {
          artifact.loading(input, "Fetching memories...");

          const memories = await memoryService.getUserMemories(userId, {
            category,
            limit: limit || 50,
          });

          artifact.complete(
            input,
            { memories, count: memories.length },
            `Found ${memories.length} stored memory${memories.length !== 1 ? "ies" : ""}`
          );

          return {
            memories: memories.map((m) => ({
              id: m.id,
              fact: m.fact,
              category: m.category,
              importance: m.importance,
              createdAt: m.createdAt,
            })),
            count: memories.length,
          };
        } catch (error) {
          artifact.error(input, error, "Failed to list memories");
          throw error;
        }
      },
    }),

    /**
     * Delete a memory
     */
    DeleteMemory: new tool({
      name: "DeleteMemory",
      description: "Delete a stored memory. Use this when the user wants to remove outdated or incorrect information.",
      inputSchema: z.object({
        memoryId: z.string().describe("The ID of the memory to delete"),
      }),
      execute: async ({ memoryId }) => {
        const artifact = new ArtifactWriter(
          writer,
          "DeleteMemory",
          artifactsCollector
        );
        const input = { memoryId };

        try {
          artifact.loading(input, "Deleting memory...");

          await memoryService.deleteMemory(userId, memoryId);

          artifact.complete(input, { success: true }, "Memory deleted");

          return {
            success: true,
            message: "Memory deleted successfully",
          };
        } catch (error) {
          artifact.error(input, error, "Failed to delete memory");
          throw error;
        }
      },
    }),
  };
};

// ============================================================================
// 5. ENHANCE CHAT CONTROLLER (controllers/conversations.js)
// ============================================================================

import { memoryService } from "../services/memory.js";

export const sendMessage = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { messages } = req.body;
    const message = messages[messages.length - 1];

    // ... existing code (ensure conversation exists, add user message, etc.)

    // NEW: Retrieve relevant memories (fast synchronous operation)
    const relevantMemories = await memoryService.retrieveRelevantMemories(
      userId,
      message.parts[0].text,
      { conversationId: conversation.id, limit: 5 }
    );

    // Format memories for context
    const memoryContext = relevantMemories.length > 0
      ? `\n\nRelevant Memories:\n${relevantMemories.map(m => `- ${m.fact}`).join('\n')}`
      : "";

    // ... existing code (get conversation history, check summarization, etc.)

    // Include memories in the system prompt or context
    const enhancedSystemPrompt = VercelMainAgentPrompt() + memoryContext;

    // AI Response (existing code)
    await vercelChatService.chatAgent({
      userId,
      userQuestion: message.parts[0].text,
      conversationSummary: formattedMessageHistory,
      model: message.metadata.model,
      recentMessages: prunedCurrentMessageHistory,
      conversationId: conversation.id,
      tokensAmountObject,
      res,
      // NEW: Pass memories to agent
      memories: relevantMemories,
    });

    // NEW: If the message contains information worth remembering,
    // you could automatically queue a memory extraction job
    // (This is optional - the agent can also use RememberFact tool)
    // await addMemoryExtractionJob({
    //   userId,
    //   conversationId: conversation.id,
    //   message: message.parts[0].text,
    // });

  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({ error: "Failed to send message" });
  }
};

// ============================================================================
// 6. INITIALIZE WORKERS (index.js or services/bullmq/jobs.js)
// ============================================================================

import { initWorkers } from "./services/bullmq/jobs.js";

// Make sure memory worker is initialized
initWorkers();

// ============================================================================
// SUMMARY: Key Points
// ============================================================================

/**
 * ✅ STORAGE = Background Job (doesn't block)
 * - RememberFact tool → queues memoryStorageJob
 * - Automatic memory extraction → queues memoryStorageJob
 * 
 * ✅ RETRIEVAL = Synchronous (fast vector search)
 * - RetrieveMemory tool → fast synchronous search
 * - Automatic retrieval in sendMessage → fast synchronous search
 * 
 * ✅ PATTERN MATCHES EXISTING CODE
 * - Storage like summarization (background job)
 * - Tools like CreateTask (explicit agent action)
 * - Retrieval like context search (synchronous but fast)
 */
