import redisClient from "../utils/redisClient.js";
import { REDIS_EXPIRE_TIME } from "../Constants.js";

export const cacheService = {
  async connect() {
    try {
      if (!redisClient.isOpen) {
        await redisClient.connect();
      }
    } catch (error) {
      console.error("Redis connect error:", error);
      // Connection failures are handled by the error event handler
    }
  },

  async status() {
    try {
      return redisClient.isOpen;
    } catch (error) {
      console.error("Redis status check error:", error);
      return false;
    }
  },

  async fetchTasks(userId) {
    const key = `tasks:${userId}`;
    try {
      if (!redisClient.isOpen) {
        await redisClient.connect();
      }
      const cached = await redisClient.get(key);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error("Redis fetchTasks error:", error);
      return []; // Return empty array on error, fallback to DB
    }
  },

  async addTasks(userId, tasks) {
    const key = `tasks:${userId}`;
    try {
      if (!redisClient.isOpen) {
        await redisClient.connect();
      }
      if (tasks.length > 0) {
        await redisClient.set(key, JSON.stringify(tasks), {
          EX: REDIS_EXPIRE_TIME,
        });
      }
    } catch (error) {
      console.error("Redis addTasks error:", error);
      // Silently fail - cache is optional, DB is source of truth
    }
  },

  async invalidateTasks(userId) {
    const key = `tasks:${userId}`;
    try {
      if (!redisClient.isOpen) {
        await redisClient.connect();
      }
      const exists = await redisClient.exists(key);
      if (exists) {
        await redisClient.del(key);
      }
    } catch (error) {
      console.error("Redis invalidateTasks error:", error);
      // Silently fail - cache invalidation is best-effort
    }
  },
};
