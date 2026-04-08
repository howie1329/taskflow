import { projectService } from "../services/projects.js";
import { BaseOperationHandler } from "./base.js";

export const createProject = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const projectData = req.body;
    const project = await projectService.createProject(projectData);
    return project;
  });
};

export const fetchProjectsByUserId = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const userId = req.userId;
    const projects = await projectService.fetchProjectsByUserId(userId);
    return projects;
  });
};

export const fetchProjectById = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const { projectId } = req.params;
    const project = await projectService.fetchProjectById(projectId);

    if (!project) {
      const error = new Error("Project not found");
      error.statusCode = 404;
      throw error;
    }

    return project;
  });
};
