import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  console.error("REDIS_URL is not set: " + redisUrl);
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

// Connect Redis client on initialization
(async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("Redis client connected successfully");
    }
  } catch (error) {
    console.error("Failed to connect Redis client:", error);
  }
})();

export default redisClient;
