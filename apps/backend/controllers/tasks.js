import { taskService } from "../services/tasks.js";
import { subtaskService } from "../services/subtasks.js";

export const createTask = async (req, res) => {
  try {
    const userId = req.userId;
    const { subtasks, ...taskData } = req.body;

    taskData.userId = userId;
    console.log("taskData", taskData);
    const task = await taskService.createTask(taskData);
    console.log("task", task);

    // Handle subtasks if provided
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

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    console.error("Create task error:", error);
    return res.status(500).json({ error: "Failed to create task" });
  }
};

export const fetchTasks = async (req, res) => {
  try {
    const userId = req.userId;
    const tasks = await taskService.fetchTasks(userId);
    return res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      data: tasks,
    });
  } catch (error) {
    console.error("Fetch tasks error:", error);
    return res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

export const fetchSingleTask = async (req, res) => {
  try {
    const userId = req.userId;
    const { taskId } = req.params;
    const task = await taskService.fetchSingleTask(taskId, userId);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Task fetched successfully",
      data: task,
    });
  } catch (error) {
    console.error("Fetch single task error:", error);
    return res.status(500).json({ error: "Failed to fetch task" });
  }
};

export const updateTask = async (req, res) => {
  try {
    const userId = req.userId;
    const { taskId } = req.params;
    const taskData = req.body;

    const task = await taskService.updateTask(taskId, userId, taskData);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    console.error("Update task error:", error);
    return res.status(500).json({ error: "Failed to update task" });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const userId = req.userId;
    const { taskId } = req.params;

    const task = await taskService.deleteTask(taskId, userId);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      data: task,
    });
  } catch (error) {
    console.error("Delete task error:", error);
    return res.status(500).json({ error: "Failed to delete task" });
  }
};

export const markTaskAsComplete = async (req, res) => {
  try {
    const userId = req.userId;
    const { taskId } = req.params;

    const task = await taskService.markTaskAsComplete(taskId, userId);

    return res.status(200).json({
      success: true,
      message: "Task marked as complete",
      data: task,
    });
  } catch (error) {
    console.error("Mark task complete error:", error);
    return res.status(500).json({ error: "Failed to mark task as complete" });
  }
};

export const markTaskAsIncomplete = async (req, res) => {
  try {
    const userId = req.userId;
    const { taskId } = req.params;

    const task = await taskService.markTaskAsIncomplete(taskId, userId);

    return res.status(200).json({
      success: true,
      message: "Task marked as incomplete",
      data: task,
    });
  } catch (error) {
    console.error("Mark task incomplete error:", error);
    return res.status(500).json({ error: "Failed to mark task as incomplete" });
  }
};

export const fetchSubtasks = async (req, res) => {
  try {
    const { taskId } = req.params;
    const subtasks = await taskService.fetchSubtasks(taskId);

    return res.status(200).json({
      success: true,
      message: "Subtasks fetched successfully",
      data: subtasks,
    });
  } catch (error) {
    console.error("Fetch subtasks error:", error);
    return res.status(500).json({ error: "Failed to fetch subtasks" });
  }
};

export const fetchNotes = async (req, res) => {
  try {
    const { taskId } = req.params;
    const notes = await taskService.fetchNotes(taskId);

    return res.status(200).json({
      success: true,
      message: "Notes fetched successfully",
      data: notes,
    });
  } catch (error) {
    console.error("Fetch notes error:", error);
    return res.status(500).json({ error: "Failed to fetch notes" });
  }
};

export const fetchTaskWithNoVector = async (req, res) => {
  try {
    const tasks = await taskService.fetchTaskWithNoVector();

    return res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      data: tasks,
    });
  } catch (error) {
    console.error("Fetch tasks with no vector error:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch tasks with no vector" });
  }
};

export const fetchTasksByProjectId = async (req, res) => {
  try {
    const { projectId } = req.params;
    const tasks = await taskService.fetchTasksByProjectId(projectId);

    return res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      data: tasks,
    });
  } catch (error) {
    console.error("Fetch tasks by project error:", error);
    return res.status(500).json({ error: "Failed to fetch tasks by project" });
  }
};
