import { Worker } from "bullmq";
import { aiChatService } from "../ai.js";
import { conversationService } from "../conversations.js";
import { redisConnection } from "./queues.js";

// New BullMQ Implementation

// Worker for summarizing Conversation and updating to database
const messageSummarizationWorker = new Worker(
  "MessageSummarizationQueue",
  async (job) => {
    console.log("Inside Message Summarization Worker");
    const { conversationHistory, userId, conversationId } = job.data;
    const summaryObject = await aiChatService.newSummarization(
      conversationHistory
    );
    console.log("Summary Object: ", summaryObject);
    await conversationService.updateConversation(userId, conversationId, {
      summary: summaryObject.summary,
      tags: summaryObject.tags,
      intent: summaryObject.intent,
      summaryMessageIndex: summaryObject.messageCount,
    });
    console.log("Conversation Updated");
    return summaryObject;
  },
  { connection: redisConnection }
);

// Worker for testing
const testWorker = new Worker(
  "TestQueue",
  async (job) => {
    const { conversationHistory } = job.data;
    const summaryObject = await aiChatService.newSummarization(
      conversationHistory
    );
    console.log("Summary Object: ", summaryObject);
    return { success: true, summaryObject };
  },
  { connection: redisConnection }
);

export { messageSummarizationWorker, testWorker };
