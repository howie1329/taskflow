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

httpServer.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  // Start the notifications cron jobs
  initWorkers();
  startNotificationCleanupCron();
  cleanupPastJobs();
});
