import { projectService } from "../services/projects.js";

export const createProject = async (req, res) => {
  try {
    const projectData = req.body;
    const project = await projectService.createProject(projectData);

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    console.error("Create project error:", error);
    return res.status(500).json({ error: "Failed to create project" });
  }
};

export const fetchProjectsByUserId = async (req, res) => {
  try {
    const userId = req.userId;
    const projects = await projectService.fetchProjectsByUserId(userId);

    return res.status(200).json({
      success: true,
      message: "Projects fetched successfully",
      data: projects,
    });
  } catch (error) {
    console.error("Fetch projects error:", error);
    return res.status(500).json({ error: "Failed to fetch projects" });
  }
};

export const fetchProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await projectService.fetchProjectById(projectId);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Project fetched successfully",
      data: project,
    });
  } catch (error) {
    console.error("Fetch project error:", error);
    return res.status(500).json({ error: "Failed to fetch project" });
  }
};
