import redisClient from "@/app/lib/redisClient";
import { auth } from "@clerk/nextjs/server";

const { userId } = auth;
const today = new Date().toISOString().split("T")[0];

export async function invalidateRedisCacheTaskFilter(filter) {
  const cacheFilterKey = `tasks:${userId}:today:${today}:filter:${filter}`;
  if (!redisClient.isOpen) {
    redisClient.connect();
  }
  const exist = redisClient.exists(cacheFilterKey);
  if (exist) {
    await redisClient.del(cacheFilterKey);
  }
}

export const invalidateAllRedisTaskFilters = () => {
  invalidateRedisCacheTaskFilter("None");
  invalidateRedisCacheTaskFilter("Low");
  invalidateRedisCacheTaskFilter("Medium");
  invalidateRedisCacheTaskFilter("High");
};
