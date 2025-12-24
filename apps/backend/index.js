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

/**
 * Get allowed origins from environment variables
 * Supports comma-separated list: ALLOWED_ORIGINS=https://example.com,https://app.example.com
 * Falls back to default origins if not set
 */
const getAllowedOrigins = () => {
  const envOrigins = process.env.ALLOWED_ORIGINS;
  
  if (envOrigins) {
    // Split by comma and trim whitespace
    return envOrigins.split(",").map((origin) => origin.trim()).filter(Boolean);
  }
  
  // Default origins for development
  return [
    "http://localhost:3001",
    "https://taskflow-git-dev-howie1329s-projects.vercel.app",
    "http://localhost:3000",
  ];
};

const allowedOrigins = getAllowedOrigins();

/**
 * Check if an origin is allowed
 * Supports exact matches and wildcard patterns for subdomains
 */
const isOriginAllowed = (origin) => {
  if (!origin) return false;
  
  // Exact match
  if (allowedOrigins.includes(origin)) {
    return true;
  }
  
  // Check for wildcard patterns (e.g., *.vercel.app)
  return allowedOrigins.some((allowedOrigin) => {
    if (allowedOrigin.includes("*")) {
      const pattern = allowedOrigin.replace(/\./g, "\\.").replace(/\*/g, ".*");
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(origin);
    }
    return false;
  });
};

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman, or same-origin requests)
    if (!origin) {
      return callback(null, true);
    }
    
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    } else {
      // Use generic error message to prevent information leakage
      return callback(new Error("CORS policy violation"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  credentials: true,
  // Cache preflight requests for 24 hours
  maxAge: 86400,
  // Expose headers that the client might need
  exposedHeaders: ["Content-Length", "Content-Type"],
  // Allow all standard headers
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
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
