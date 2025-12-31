import express from "express";
import {
  createSubtask,
  updateSubtask,
  markSubtaskAsComplete,
  markSubtaskAsIncomplete,
  deleteSubtask,
} from "../../controllers/subtasks.js";
import { validate } from "../../middleware/validation.js";
import {
  createSubtaskSchema,
  updateSubtaskSchema,
  subtaskParamsSchema,
} from "../../validation/schemas.js";

const router = express.Router();

router.post("/create", validate(createSubtaskSchema), createSubtask);
router.patch("/update/:subtaskId", validate(updateSubtaskSchema), updateSubtask);
router.patch("/complete/:subtaskId", validate(subtaskParamsSchema), markSubtaskAsComplete);
router.patch("/incomplete/:subtaskId", validate(subtaskParamsSchema), markSubtaskAsIncomplete);
router.delete("/delete/:subtaskId", validate(subtaskParamsSchema), deleteSubtask);

export default router;
