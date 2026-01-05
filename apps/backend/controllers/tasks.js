import { taskService } from "../services/tasks.js";
import { subtaskService } from "../services/subtasks.js";
import { BaseOperationHandler } from "./base.js";

export const createTask = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const userId = req.userId;
    const { subtasks, ...taskData } = req.body;
    taskData.userId = userId;
    const task = await taskService.createTask(taskData);

    if (subtasks && subtasks.length > 0) {
      const subtasksWithTaskId = subtasks
        .filter((subtask) => subtask !== "")
        .map((subtask) => ({
          subtaskName: subtask,
          taskId: task.id,
        }));

      if (subtasksWithTaskId.length > 0) {
        await subtaskService.createMultipleSubtasks(subtasksWithTaskId);
      }
    }
    return task;
  });
};

export const fetchTasks = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const userId = req.userId;
    const tasks = await taskService.fetchTasks(userId);
    return tasks;
  });
};

export const fetchSingleTask = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const userId = req.userId;
    const { taskId } = req.params;
    const task = await taskService.fetchSingleTask(taskId, userId);

    if (!task) {
      const error = new Error("Task not found");
      error.statusCode = 404;
      throw error;
    }

    return task;
  });
};

export const updateTask = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const userId = req.userId;
    const { taskId } = req.params;
    const taskData = req.body;

    const task = await taskService.updateTask(taskId, userId, taskData);

    if (!task) {
      const error = new Error("Task not found");
      error.statusCode = 404;
      throw error;
    }

    return task;
  });
};

export const deleteTask = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const userId = req.userId;
    const { taskId } = req.params;

    const task = await taskService.deleteTask(taskId, userId);

    if (!task) {
      const error = new Error("Task not found");
      error.statusCode = 404;
      throw error;
    }

    return task;
  });
};

export const markTaskAsComplete = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const userId = req.userId;
    const { taskId } = req.params;
    const task = await taskService.markTaskAsComplete(taskId, userId);
    return task;
  });
};

export const markTaskAsIncomplete = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const userId = req.userId;
    const { taskId } = req.params;
    const task = await taskService.markTaskAsIncomplete(taskId, userId);
    return task;
  });
};

export const fetchSubtasks = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const { taskId } = req.params;
    const subtasks = await taskService.fetchSubtasks(taskId);
    return subtasks;
  });
};

export const fetchNotes = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const { taskId } = req.params;
    const notes = await taskService.fetchNotes(taskId);
    return notes;
  });
};

export const fetchTaskWithNoVector = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const tasks = await taskService.fetchTaskWithNoVector();
    return tasks;
  });
};

export const fetchTasksByProjectId = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const { projectId } = req.params;
    const tasks = await taskService.fetchTasksByProjectId(projectId);
    return tasks;
  });
};
