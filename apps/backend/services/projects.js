import { projectOps } from "../db/operations/projects.js";
import { emitToRoom } from "../sockets/index.js";

// TODO: Create Notification when a project is created and when a project is updated and when a project is deleted
// Move creating of a notification to the bullmq queue to avoid blocking the main thread
// TODO: Emit the notification to the user using the socket and refresh the projects list
export const projectService = {
  async createProject(projectData) {
    const project = await projectOps.create(projectData);

    if (project) {
      emitToRoom(project.userId, "project-created", {});
    }

    return project;
  },

  async fetchProjectsByUserId(userId) {
    return await projectOps.findByUserId(userId);
  },

  async fetchProjectById(projectId) {
    return await projectOps.findById(projectId);
  },

  async updateProject(projectId, updates) {
    return await projectOps.update(projectId, updates);
  },

  async deleteProject(projectId) {
    return await projectOps.delete(projectId);
  },
};
