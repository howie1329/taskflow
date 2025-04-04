import redisClient from "@/app/lib/redisClient";

const client = redisClient;

export async function fetchAllTasksRedis(userId) {
  const key = `tasks:${userId}`;
  if (!client.isOpen) {
    await client.connect();
  }

  const tasks = await client.get(key);

  if (tasks != null) {
    return tasks;
  }

  return [];
}

export async function setAllTaskRedis(userId, item) {
  const key = `tasks:${userId}`;
  if (item.length > 0) {
    await client.set(key, JSON.stringify(item), { EX: 480 }); // 8 minutes
  }
}

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
