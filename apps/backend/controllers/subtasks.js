import { subtaskService } from "../services/subtasks.js";

export const createSubtask = async (req, res) => {
  try {
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

    return res.status(201).json({
      success: true,
      message: "Subtask created successfully",
      data: subtask,
    });
  } catch (error) {
    console.error("Create subtask error:", error);
    return res.status(500).json({
      error: "Failed to create subtask",
      details: error.message,
    });
  }
};

export const updateSubtask = async (req, res) => {
  try {
    const { subtaskId } = req.params;
    const subtaskData = req.body;

    const subtask = await subtaskService.updateSubtask(subtaskId, subtaskData);

    if (!subtask) {
      return res.status(404).json({ error: "Subtask not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Subtask updated successfully",
      data: subtask,
    });
  } catch (error) {
    console.error("Update subtask error:", error);
    return res.status(500).json({ error: "Failed to update subtask" });
  }
};

export const markSubtaskAsComplete = async (req, res) => {
  try {
    const { subtaskId } = req.params;
    const subtask = await subtaskService.markSubtaskAsComplete(subtaskId);

    if (!subtask) {
      return res.status(404).json({ error: "Subtask not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Subtask marked as complete",
      data: subtask,
    });
  } catch (error) {
    console.error("Mark subtask complete error:", error);
    return res
      .status(500)
      .json({ error: "Failed to mark subtask as complete" });
  }
};

export const markSubtaskAsIncomplete = async (req, res) => {
  try {
    const { subtaskId } = req.params;
    const subtask = await subtaskService.markSubtaskAsIncomplete(subtaskId);

    if (!subtask) {
      return res.status(404).json({ error: "Subtask not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Subtask marked as incomplete",
      data: subtask,
    });
  } catch (error) {
    console.error("Mark subtask incomplete error:", error);
    return res
      .status(500)
      .json({ error: "Failed to mark subtask as incomplete" });
  }
};

export const deleteSubtask = async (req, res) => {
  try {
    const { subtaskId } = req.params;
    const subtask = await subtaskService.deleteSubtask(subtaskId);

    if (!subtask) {
      return res.status(404).json({ error: "Subtask not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Subtask deleted successfully",
      data: subtask,
    });
  } catch (error) {
    console.error("Delete subtask error:", error);
    return res.status(500).json({ error: "Failed to delete subtask" });
  }
};
