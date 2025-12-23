import express from "express";
import {
  createSubtask,
  updateSubtask,
  markSubtaskAsComplete,
  markSubtaskAsIncomplete,
  deleteSubtask,
} from "../../controllers/subtasks.js";

const router = express.Router();

router.post("/create", createSubtask);
router.patch("/update/:subtaskId", updateSubtask);
router.patch("/complete/:subtaskId", markSubtaskAsComplete);
router.patch("/incomplete/:subtaskId", markSubtaskAsIncomplete);
router.delete("/delete/:subtaskId", deleteSubtask);

export default router;
