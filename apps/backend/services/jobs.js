import { Queue, Worker } from "bullmq";
import Redis from "ioredis";
import { conversationOps } from "../db/operations/conversations.js";
import { messageOps } from "../db/operations/messages.js";
import { notificationOps } from "../db/operations/notifications.js";
import { emitToRoom } from "../sockets/index.js";
import { emitToAllUsers } from "../sockets/index.js";
import { aiChatService } from "./ai.js";
import { embeddingService } from "./ai.js";
import { convertToModelMessages } from "ai";

// Old Jobs Implementation that is no longer used
// This Can be removed after testing is complete
// Must check to see if all jobs are migrated to BullMQ
const workers = {};

const connection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

// Queues
const aiChatSummarizationQueue = new Queue("creatingAiChatSummarizationQueue", {
  connection,
});
const aiMessageEmbeddingQueue = new Queue(
  "creatingAiMessageResponseEmbeddingQueue",
  { connection }
);
const notificationsQueue = new Queue("notifications", { connection });
const notificationsCleanUpQueue = new Queue("notificationsCleanUp", {
  connection,
});

const testQueue = new Queue("testQueue", { connection });

// Export job creation functions
export const createAiSummarizationJob = async (data) => {
  await aiChatSummarizationQueue.add("creatingAiChatSummarizationJob", data);
  console.log("AI Chat Summarization Job Created");
};

export const createAiEmbeddingJob = async (data) => {
  await aiMessageEmbeddingQueue.add(
    "creatingAiMessageResponseEmbeddingJob",
    data
  );
};

export const createNotificationJob = async (data) => {
  await notificationsQueue.add("notificationsJob", data);
};

export const createTestJob = async (data) => {
  await testQueue.add("testJob", data);
};

// Workers will be initialized in a separate file or in index.js
export const initWorkers = () => {
  console.log("Initializing Workers");
  console.log("Redis Connection", connection.status);

  workers.testWorker = new Worker(
    "testQueue",
    async (job) => {
      console.log("Test job started");
      return { success: true };
    },
    { connection }
  );
  // AI Chat Summarization Worker
  workers.aiChatSummarizationWorker = new Worker(
    "creatingAiChatSummarizationQueue",
    async (job) => {
      console.log("Inside AI Chat Summarization Worker");
      const {
        deltaMessages,
        pastSummaries,
        totalMessages,
        conversationId,
        userId,
      } = job.data;
      try {
        console.log("Delta Messages", deltaMessages);
        const tansformedMessages = convertToModelMessages(deltaMessages);
        const formattedTansformedMessages = tansformedMessages.map(
          (message) => {
            return {
              role: message.role,
              content: message.content,
            };
          }
        );
        console.log(
          "Formatted Transformed Messages",
          formattedTansformedMessages
        );
        const deltaSummary = await aiChatService.summarization(
          formattedTansformedMessages
        );
        console.log("Delta Summary", deltaSummary);
        const title = await aiChatService.titleConversation(
          deltaSummary,
          formattedTansformedMessages
        );
        console.log("Title", title);
        await conversationOps.updateSummary(
          conversationId,
          userId,
          deltaSummary,
          totalMessages,
          title
        );
        console.log("Conversation Summary Updated");
        return {
          success: true,
          conversationId,
          summaryLength: deltaSummary.length,
        };
      } catch (error) {
        console.error("Error in AI summarization worker:", error);
        throw error;
      }
    },
    { connection }
  );

  // AI Message Embedding Worker
  workers.aiMessageEmbeddingWorker = new Worker(
    "creatingAiMessageResponseEmbeddingQueue",
    async (job) => {
      const { aiMessageResponse, conversationId, userId, messageId } = job.data;
      try {
        const vectors = await embeddingService.embeddingPrompt(
          aiMessageResponse
        );
        await messageOps.updateEmbedding(
          messageId,
          conversationId,
          userId,
          vectors
        );
        return { success: true, conversationId };
      } catch (error) {
        console.error("Error in AI message embedding worker:", error);
        return { success: false, conversationId, error: error.message };
      }
    },
    { connection }
  );

  // Notifications Worker
  workers.notificationsWorker = new Worker(
    "notifications",
    async (job) => {
      const { userId, title, content } = job.data;
      try {
        await notificationOps.create({ user_id: userId, title, content });
        emitToRoom(userId, "notification-created", { title, content });
        return { success: true, userId, title, content };
      } catch (error) {
        console.error("Error in notifications worker:", error);
        throw error;
      }
    },
    { connection }
  );

  // Notifications Cleanup Worker
  workers.notificationsCleanupWorker = new Worker(
    "notificationsCleanUp",
    async (job) => {
      try {
        await notificationOps.deleteIfRead();
        emitToAllUsers("notifications-clean-up", {});
        console.log("Notifications cleaned up at", new Date());
      } catch (error) {
        console.error("Error in notifications cleanup worker:", error);
        throw error;
      }
    },
    { connection }
  );
};

// Cron Jobs
export const startNotificationCleanupCron = async () => {
  await notificationsCleanUpQueue.add(
    "notificationsCleanUpJob",
    {},
    {
      repeat: { pattern: "* */6 * * *" },
      jobId: "notificationsCleanUpJob",
    }
  );
};

export const cleanupPastJobs = async () => {
  await notificationsQueue.drain(0, 1000, true);
  await notificationsCleanUpQueue.drain(0, 1000, true);

  const schedulers1 = await notificationsQueue.getJobSchedulers();
  const schedulers2 = await notificationsCleanUpQueue.getJobSchedulers();

  await Promise.all(
    schedulers1.map((job) => notificationsQueue.removeJobScheduler(job.key))
  );
  await Promise.all(
    schedulers2.map((job) =>
      notificationsCleanUpQueue.removeJobScheduler(job.key)
    )
  );
};
