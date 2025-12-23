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

const router = express.Router();

router.get("/user", fetchTasks);
router.get("/user/:taskId", fetchSingleTask);
router.get("/subtasks/:taskId", fetchSubtasks);
router.get("/notes/:taskId", fetchNotes);
router.get("/no-vector", fetchTaskWithNoVector);
router.get("/project/:projectId", fetchTasksByProjectId);
router.post("/create", createTask);
router.patch("/update/:taskId", updateTask);
router.patch("/complete/:taskId", markTaskAsComplete);
router.patch("/incomplete/:taskId", markTaskAsIncomplete);
router.delete("/delete/:taskId", deleteTask);

export default router;
