import redisClient from "../utils/redisClient.js";
import { getIO } from "../sockets/index.js";

/**
 * Redis Pub/Sub Service for AI Chat Streaming
 * 
 * This service handles publishing chat stream chunks to Redis channels
 * and subscribing to those channels to emit events via Socket.io
 */

// Channel prefix for chat streams
const CHAT_STREAM_CHANNEL_PREFIX = "chat:stream:";

/**
 * Get the Redis channel name for a conversation
 * @param {string} conversationId - The conversation ID
 * @returns {string} The Redis channel name
 */
export const getChatStreamChannel = (conversationId) => {
  return `${CHAT_STREAM_CHANNEL_PREFIX}${conversationId}`;
};

/**
 * Publish a chat stream chunk to Redis
 * @param {string} conversationId - The conversation ID
 * @param {Object} chunk - The stream chunk data
 */
export const publishChatChunk = async (conversationId, chunk) => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    const channel = getChatStreamChannel(conversationId);
    const message = JSON.stringify({
      conversationId,
      timestamp: new Date().toISOString(),
      ...chunk,
    });

    await redisClient.publish(channel, message);
  } catch (error) {
    console.error("Error publishing chat chunk to Redis:", error);
    throw error;
  }
};

/**
 * Publish a chat stream start event
 * @param {string} conversationId - The conversation ID
 * @param {Object} metadata - Initial metadata
 */
export const publishChatStart = async (conversationId, metadata = {}) => {
  await publishChatChunk(conversationId, {
    type: "start",
    ...metadata,
  });
};

/**
 * Publish a chat stream text delta
 * @param {string} conversationId - The conversation ID
 * @param {string} textDelta - The text delta
 */
export const publishChatTextDelta = async (conversationId, textDelta) => {
  await publishChatChunk(conversationId, {
    type: "text-delta",
    textDelta,
  });
};

/**
 * Publish a chat stream finish event
 * @param {string} conversationId - The conversation ID
 * @param {Object} metadata - Final metadata
 */
export const publishChatFinish = async (conversationId, metadata = {}) => {
  await publishChatChunk(conversationId, {
    type: "finish",
    ...metadata,
  });
};

/**
 * Publish a chat stream error event
 * @param {string} conversationId - The conversation ID
 * @param {Object} error - Error information
 */
export const publishChatError = async (conversationId, error) => {
  await publishChatChunk(conversationId, {
    type: "error",
    error: {
      message: error.message,
      stack: error.stack,
    },
  });
};

/**
 * Subscribe to chat stream channels and emit via Socket.io
 * This should be called once on server startup
 */
export const subscribeToChatStreams = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    // Create a separate subscriber client for pub/sub
    // Note: Redis client cannot be used for both pub/sub and regular operations
    const { createClient } = await import("redis");
    const subscriberClient = createClient({
      url: process.env.REDIS_URL,
    });

    await subscriberClient.connect();

    // Subscribe to all chat stream channels using pattern matching
    const pattern = `${CHAT_STREAM_CHANNEL_PREFIX}*`;
    
    // Set up pattern subscription
    // In redis v5, pSubscribe uses an event-based API
    subscriberClient.on("pmessage", (pattern, channel, message) => {
      try {
        const data = JSON.parse(message);
        const conversationId = data.conversationId || channel.replace(CHAT_STREAM_CHANNEL_PREFIX, "");

        // Emit to Socket.io room for this conversation
        const io = getIO();
        io.to(conversationId).emit("chat:stream", data);

        // Also emit to user-specific room if userId is available
        if (data.userId) {
          io.to(data.userId).emit("chat:stream", {
            ...data,
            conversationId,
          });
        }
      } catch (error) {
        console.error("Error processing chat stream message:", error);
      }
    });

    // Subscribe to the pattern
    await subscriberClient.pSubscribe(pattern);

    console.log(`Subscribed to Redis chat stream channels: ${pattern}`);
    
    // Store subscriber client for cleanup if needed
    return subscriberClient;
  } catch (error) {
    console.error("Error subscribing to chat streams:", error);
    throw error;
  }
};
