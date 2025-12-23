import { taskOps } from "../db/operations/tasks.js";
import { subtaskOps } from "../db/operations/subtasks.js";
import { noteOps } from "../db/operations/notes.js";
import { cacheService } from "./cache.js";
import { createNotificationJob } from "./jobs.js";
import { embeddingService } from "./ai.js";

export const taskService = {
  async createTask(taskData) {
    // Create embedding for task
    const embedding = await embeddingService.createEmbedding(
      taskData.title + " " + taskData.description
    );
    taskData.vector = embedding;

    const task = await taskOps.create(taskData);

    if (task) {
      await cacheService.invalidateTasks(task.userId);

      // Create notification
      await createNotificationJob({
        userId: taskData.userId,
        title: "Task Created",
        content: `Task ${taskData.title} has been created`,
      });
    }

    return task;
  },

  async fetchTasks(userId) {
    const cacheStatus = await cacheService.status();
    console.log("cacheStatus", cacheStatus);
    if (cacheStatus) {
      const cachedTasks = await cacheService.fetchTasks(userId);
      if (cachedTasks.length > 0) {
        return cachedTasks;
      }
    }
    const tasks = await taskOps.findByUserId(userId);
    if (cacheStatus && tasks.length > 0) {
      await cacheService.addTasks(userId, tasks);
    }
    return tasks;
  },

  async fetchSingleTask(taskId, userId) {
    return await taskOps.findById(taskId, userId);
  },

  async updateTask(taskId, userId, updates, emitToUser) {
    const task = await taskOps.update(taskId, userId, updates);

    if (task) {
      await cacheService.invalidateTasks(userId);

      await createNotificationJob({
        userId: task.userId,
        title: "Task Updated",
        content: `Task ${task.title} has been updated`,
      });
    }

    return task;
  },

  async deleteTask(taskId, userId, emitToUser) {
    const task = await taskOps.delete(taskId, userId);

    if (task) {
      await cacheService.invalidateTasks(task.userId);

      await createNotificationJob({
        userId: task.userId,
        title: "Task Deleted",
        content: `Task ${task.title} has been deleted`,
      });
    }

    return task;
  },

  async markTaskAsComplete(taskId, userId, emitToUser) {
    const task = await taskOps.findById(taskId, userId);
    if (!task) {
      throw new Error("Task not found");
    }

    const updatedTask = await taskOps.markComplete(taskId);

    if (updatedTask) {
      await cacheService.invalidateTasks(userId);

      await createNotificationJob({
        userId: task.userId,
        title: "Task Updated",
        content: `Task ${task.title} has been marked as complete`,
      });
    }

    return updatedTask;
  },

  async markTaskAsIncomplete(taskId, userId, emitToUser) {
    const task = await taskOps.findById(taskId, userId);
    if (!task) {
      throw new Error("Task not found");
    }

    const updatedTask = await taskOps.markIncomplete(taskId);

    if (updatedTask) {
      await cacheService.invalidateTasks(userId);

      await createNotificationJob({
        userId: task.userId,
        title: "Task Updated",
        content: `Task ${task.title} has been marked as incomplete`,
      });
    }

    return updatedTask;
  },

  async fetchSubtasks(taskId) {
    return await subtaskOps.findByTaskId(taskId);
  },

  async fetchNotes(taskId) {
    return await noteOps.findByTaskId(taskId);
  },

  async fetchTaskWithNoVector() {
    const tasks = await taskOps.findWithNoVector();

    await Promise.all(
      tasks.map(async (task) => {
        const embedding = await embeddingService.createEmbedding(
          task.title + " " + task.description
        );
        task.vector = embedding;
        await taskOps.update(task.id, task.userId, { vector: embedding });
      })
    );

    return tasks;
  },

  async fetchTasksByProjectId(projectId) {
    return await taskOps.findByProjectId(projectId);
  },
};
