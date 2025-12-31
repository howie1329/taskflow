import "dotenv/config";
import express, { json } from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { createServer } from "http";
import {
  cleanupPastJobs,
  initWorkers,
  startNotificationCleanupCron,
} from "./services/jobs.js";
import router from "./routes/v1/index.js";
import { initSocket } from "./sockets/index.js";
import "./services/bullmq/jobs.js";
import { cacheService } from "./services/cache.js";
import { subscribeToChatStreams } from "./services/redisPubSub.js";

const allowedOrigins = [
  "https://thetaskflow.app",
  "https://dev.thetaskflow.app",
  "http://localhost:3001",
  "https://taskflow-git-dev-howie1329s-projects.vercel.app",
  "https://taskflow-*-howie1329s-projects.vercel.app",
  "http://localhost:3000",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  credentials: true,
};
const app = express();
const httpServer = createServer(app);
const port = 3001;

app.use(cors(corsOptions));
app.use(json());
app.use(clerkMiddleware());

app.use("/api/v1", router);

initSocket(httpServer, corsOptions);

httpServer.listen(port, async () => {
  console.log(`Server is running at http://localhost:${port}`);
  // Start the notifications cron jobs
  await cacheService.connect();
  
  // Initialize Redis pub/sub for chat streaming
  try {
    await subscribeToChatStreams();
    console.log("Redis pub/sub subscriber initialized for chat streaming");
  } catch (error) {
    console.error("Failed to initialize Redis pub/sub subscriber:", error);
  }
  
  initWorkers();
  startNotificationCleanupCron();
  cleanupPastJobs();
});
