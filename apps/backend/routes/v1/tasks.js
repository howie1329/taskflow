import express from "express";
import {
  createTask,
  fetchTasks,
  fetchSingleTask,
  updateTask,
  deleteTask,
  markTaskAsComplete,
  markTaskAsIncomplete,
  fetchSubtasks,
  fetchNotes,
  fetchTaskWithNoVector,
  fetchTasksByProjectId,
} from "../../controllers/tasks.js";
import { validate } from "../../middleware/validation.js";
import {
  createTaskSchema,
  updateTaskSchema,
  taskParamsSchema,
  projectParamsSchema,
} from "../../validation/schemas.js";

const router = express.Router();

router.get("/user", fetchTasks);
router.get("/user/:taskId", validate(taskParamsSchema), fetchSingleTask);
router.get("/subtasks/:taskId", validate(taskParamsSchema), fetchSubtasks);
router.get("/notes/:taskId", validate(taskParamsSchema), fetchNotes);
router.get("/no-vector", fetchTaskWithNoVector);
router.get("/project/:projectId", validate(projectParamsSchema), fetchTasksByProjectId);
router.post("/create", validate(createTaskSchema), createTask);
router.patch("/update/:taskId", validate(updateTaskSchema), updateTask);
router.patch("/complete/:taskId", validate(taskParamsSchema), markTaskAsComplete);
router.patch("/incomplete/:taskId", validate(taskParamsSchema), markTaskAsIncomplete);
router.delete("/delete/:taskId", validate(taskParamsSchema), deleteTask);

export default router;
