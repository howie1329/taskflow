import redisClient from "@/app/lib/redisClient";
import { auth } from "@clerk/nextjs/server";

const client = redisClient;

export async function invalidateAllRedisTask() {
  const { userId } = await auth;
  const key = `tasks:${userId}`;
  if (!client.isOpen) {
    await client.connect();
  }

  const exist = await client.exists(key);
  if (exist) {
    console.log("Exist", exist);
    await client.del(key);
  }
}

export async function invalidateRedisCacheTaskFilter(filter) {
  const { userId } = await auth;
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

export const invalidateAllRedisTaskFilters = () => {
  if (!client.isOpen) {
    client.connect();
  }
  invalidateRedisCacheTaskFilter("None");
  invalidateRedisCacheTaskFilter("Low");
  invalidateRedisCacheTaskFilter("Medium");
  invalidateRedisCacheTaskFilter("High");
};
