import redisClient from "@/app/lib/redisClient";

const client = redisClient;

export async function invalidateAllRedisTask(userId) {
  const key = `tasks:${userId}`;
  if (!client.isOpen) {
    await client.connect();
  }

  const exist = await client.exists(key);
  if (exist) {
    await client.del(key);
  }
}

export async function invalidateRedisCacheTaskFilter(userId, filter) {
  const today = new Date().toISOString().split("T")[0];
  const cacheFilterKey = `tasks:${userId}:today:${today}:filter:${filter}`;
  if (!client.isOpen) {
    await client.connect();
  }
  const exist = await client.exists(cacheFilterKey);
  if (exist) {
    await client.del(cacheFilterKey);
  }
}

export const invalidateAllRedisTaskFilters = (userId) => {
  if (!client.isOpen) {
    client.connect();
  }
  invalidateRedisCacheTaskFilter(userId, "None");
  invalidateRedisCacheTaskFilter(userId, "Low");
  invalidateRedisCacheTaskFilter(userId, "Medium");
  invalidateRedisCacheTaskFilter(userId, "High");
};
