import { subtaskOps } from "../db/operations/subtasks.js";

export const subtaskService = {
  async createSubtask(subtaskData) {
    return await subtaskOps.create(subtaskData);
  },

  async createMultipleSubtasks(subtasksData) {
    return await subtaskOps.createMultiple(subtasksData);
  },

  async updateSubtask(subtaskId, updates) {
    return await subtaskOps.update(subtaskId, updates);
  },

  async markSubtaskAsComplete(subtaskId) {
    return await subtaskOps.markComplete(subtaskId);
  },

  async markSubtaskAsIncomplete(subtaskId) {
    return await subtaskOps.markIncomplete(subtaskId);
  },

  async fetchSubtasksByTaskId(taskId) {
    return await subtaskOps.findByTaskId(taskId);
  },

  async deleteSubtask(subtaskId) {
    return await subtaskOps.delete(subtaskId);
  },
};
