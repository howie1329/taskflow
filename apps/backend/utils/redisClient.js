import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();

const redisUrl = process.env.REDIS_URL || process.env.REDIS_PUBLIC_URL;
if (!redisUrl) {
  console.error("REDIS_URL is not set");
  throw new Error("REDIS_URL is not set");
}

const redisClient = createClient({
  url: redisUrl,
});

// Add error handling
redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

redisClient.on("connect", () => {
  console.log("Redis Client Connected");
});

redisClient.on("ready", () => {
  console.log("Redis Client Ready");
});

redisClient.on("end", () => {
  console.log("Redis Client Disconnected");
});

export default redisClient;
