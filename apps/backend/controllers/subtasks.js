import { subtaskService } from "../services/subtasks.js";
import { BaseOperationHandler } from "./base.js";

export const createSubtask = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const subtaskData = req.body;
    console.log("Received subtask data:", subtaskData);

    // Ensure the data format matches Drizzle schema (camelCase)
    const formattedData = {
      taskId: subtaskData.taskId || subtaskData.task_id,
      subtaskName: subtaskData.subtaskName || subtaskData.subtask_name,
      isComplete: subtaskData.isComplete ?? subtaskData.is_complete ?? false,
    };

    console.log("Formatted subtask data:", formattedData);
    const subtask = await subtaskService.createSubtask(formattedData);
    return subtask;
  });
};

export const updateSubtask = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const { subtaskId } = req.params;
    const subtaskData = req.body;

    const subtask = await subtaskService.updateSubtask(subtaskId, subtaskData);

    if (!subtask) {
      const error = new Error("Subtask not found");
      error.statusCode = 404;
      throw error;
    }

    return subtask;
  });
};

export const markSubtaskAsComplete = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const { subtaskId } = req.params;
    const subtask = await subtaskService.markSubtaskAsComplete(subtaskId);

    if (!subtask) {
      const error = new Error("Subtask not found");
      error.statusCode = 404;
      throw error;
    }

    return subtask;
  });
};

export const markSubtaskAsIncomplete = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const { subtaskId } = req.params;
    const subtask = await subtaskService.markSubtaskAsIncomplete(subtaskId);

    if (!subtask) {
      const error = new Error("Subtask not found");
      error.statusCode = 404;
      throw error;
    }

    return subtask;
  });
};

export const deleteSubtask = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const { subtaskId } = req.params;
    const subtask = await subtaskService.deleteSubtask(subtaskId);

    if (!subtask) {
      const error = new Error("Subtask not found");
      error.statusCode = 404;
      throw error;
    }

    return subtask;
  });
};
