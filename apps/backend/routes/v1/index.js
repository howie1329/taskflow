import express from "express";
import { requireAuth } from "../../middleware/auth.js";
import taskRoutes from "./tasks.js";
import noteRoutes from "./notes.js";
import subtaskRoutes from "./subtasks.js";
import projectRoutes from "./projects.js";
import aiRoutes from "./ai.js";
import searchRoutes from "./search.js";
import notificationRoutes from "./notifications.js";
import conversationRoutes from "./conversations.js";

const router = express.Router();

// Apply authentication to all v1 routes
router.use(requireAuth);

// Mount route groups
router.use("/tasks", taskRoutes);
router.use("/notes", noteRoutes);
router.use("/subtasks", subtaskRoutes);
router.use("/projects", projectRoutes);
router.use("/notifications", notificationRoutes);
router.use("/ai", aiRoutes);
router.use("/smart-search", searchRoutes);
router.use("/conversations", conversationRoutes);

export default router;
