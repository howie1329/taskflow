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
import { emitToRoom, initSocket } from "./sockets/index.js";
import {
  Experimental_Agent as agent,
  convertToModelMessages,
  createUIMessageStream,
  pipeUIMessageStreamToResponse,
} from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import "./services/bullmq/jobs.js";
import Exa from "exa-js";

const allowedOrigins = [
  "http://localhost:3001",
  "https://taskflow-git-dev-howie1329s-projects.vercel.app",
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

app.get("/test", async (req, res) => {
  const exa = new Exa(process.env.EXA_API_KEY);
  const result = await exa.search(
    "How can i implement rag in my express js backend?",
    {
      contents: {
        text: {
          maxCharacters: 2500,
        },
        summary: {
          query: "What is the main idea of the sources?",
        },
        livecrawl: "preferred",
        livecrawlTimeout: 12500,
        context: {
          maxCharacters: 5000,
        },
        highlights: {
          highlightsPerUrl: 2,
          numSentences: 1,
          query: "What is the main idea of the sources?",
        },
      },
      numResults: 4,
      type: "auto",
    }
  );
  res.status(200).json({ message: "Test job created", result: result });
});

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages) {
      return res.status(400).json({ error: "Messages are required" });
    }

    const userId = "user_2usb0Md2SjCvMehu1XHJBN2y03c";

    const openRouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_AI_KEY,
    });

    // Correct agent instantiation
    const Agent = new agent({
      model: openRouter("openai/gpt-4o-mini"),
      system: "You are a helpful assistant",
    });

    emitToRoom(userId, "title-generated", { title: "Hello World" });
    const convertedMessages = convertToModelMessages(messages);
    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        writer.write({
          type: "data-notification",
          id: "processing-request",
          data: { message: "Starting request...", level: "info" },
        });
        const result = Agent.stream({ messages: convertedMessages });
        writer.write({
          type: "data-notification",
          id: "processing-request",
          data: { message: "Request in progress...", level: "info" },
        });
        writer.write({
          type: "data-notification",
          id: "processing-request",
          data: { message: "Request completed successfully", level: "info" },
        });
        writer.merge(result.toUIMessageStream());
      },
    });

    pipeUIMessageStreamToResponse({
      response: res,
      status: 200,
      stream: stream,
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.use("/api/v1", router);

initSocket(httpServer, corsOptions);

httpServer.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  // Start the notifications cron jobs
  initWorkers();
  startNotificationCleanupCron();
  cleanupPastJobs();
});
