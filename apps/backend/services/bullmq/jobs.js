import { Worker } from "bullmq";
import { aiChatService } from "../ai.js";
import { redisConnection } from "./queues.js";
import { messageHistorySummaryOps } from "../../db/operations/message_summaries.js";

// New BullMQ Implementation

// Worker for summarizing Conversation and updating to database
const messageSummarizationWorker = new Worker(
  "MessageSummarizationQueue",
  async (job) => {
    const { conversationHistory, userId, conversationId, lastSummaryIndex } =
      job.data;
    const summaryObject =
      await aiChatService.newSummarization(conversationHistory);

    console.log("Summary Object: ", summaryObject);

    await messageHistorySummaryOps.create(conversationId, userId, {
      ...summaryObject,
      messageIndex: lastSummaryIndex + summaryObject.messageCount,
    });

    console.log("Message History Summary Created");
    return summaryObject;
  },
  { connection: redisConnection }
);

// Worker for testing
const testWorker = new Worker(
  "TestQueue",
  async (job) => {
    const { conversationHistory } = job.data;
    const summaryObject =
      await aiChatService.newSummarization(conversationHistory);
    console.log("Summary Object: ", summaryObject);
    return { success: true, summaryObject };
  },
  { connection: redisConnection }
);

export { messageSummarizationWorker, testWorker };
