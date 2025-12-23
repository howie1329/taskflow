import { Queue } from "bullmq";
import Redis from "ioredis";

// New BullMQ Implementation

const redisConnection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

// Queue For summarizing Conversation and updating to database
const summarizationQueue = new Queue("MessageSummarizationQueue", {
  connection: redisConnection,
});

// Queue For testing
const testQueue = new Queue("TestQueue", {
  connection: redisConnection,
});

// Adding Message Summarization Job to the Queue
const addMessageSummarizationJob = async (data) => {
  console.log("Adding Message Summarization Job to the Queue");
  await summarizationQueue.add("MessageSummarizationJob", data);
  console.log("Message Summarization Job Added to the Queue");
};

// Adding Test Job to the Queue
const addTestJob = async (data) => {
  console.log("Adding Test Job to the Queue");
  await testQueue.add("TestJob", data);
  console.log("Test Job Added to the Queue");
};

export {
  summarizationQueue,
  testQueue,
  addMessageSummarizationJob,
  addTestJob,
  redisConnection,
};
