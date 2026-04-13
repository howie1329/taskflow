import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc } from "./_generated/dataModel";
import { DEFAULT_PROJECT_COLOR, DEFAULT_PROJECT_ICON } from "./constants";

// Get all projects for the current user
export const listMyProjects = query({
  args: {
    status: v.optional(
      v.union(v.literal("active"), v.literal("archived"), v.literal("deleted")),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let projects: Doc<"projects">[];

    if (args.status) {
      // Filter by status
      projects = await ctx.db
        .query("projects")
        .withIndex("by_user_status", (q) =>
          q
            .eq("userId", userId)
            .eq("status", args.status as Doc<"projects">["status"]),
        )
        .collect();
    } else {
      // Get all projects for user
      projects = await ctx.db
        .query("projects")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
    }

    // Sort by updatedAt desc, then createdAt desc
    return projects.sort((a, b) => {
      if (a.updatedAt !== b.updatedAt) {
        return b.updatedAt - a.updatedAt;
      }
      return b.createdAt - a.createdAt;
    });
  },
});

// Get a single project by ID (with ownership check)
export const getMyProject = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      return null;
    }

    return project;
  },
});

// Create a new project for the current user
export const createProject = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();

    const projectId = await ctx.db.insert("projects", {
      userId,
      title: args.title,
      description: args.description,
      status: "active",
      color: args.color ?? DEFAULT_PROJECT_COLOR,
      icon: args.icon ?? DEFAULT_PROJECT_ICON,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(projectId);
  },
});

// Update an existing project (with ownership check)
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("active"), v.literal("archived"), v.literal("deleted")),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or access denied");
    }

    const now = Date.now();

    // Build patch object with only provided fields
    const patch: Partial<Doc<"projects">> = {
      updatedAt: now,
    };

    if (args.title !== undefined) patch.title = args.title;
    if (args.description !== undefined) patch.description = args.description;
    if (args.color !== undefined) patch.color = args.color;
    if (args.icon !== undefined) patch.icon = args.icon;
    if (args.status !== undefined) patch.status = args.status;

    await ctx.db.patch(args.projectId, patch);
    return await ctx.db.get(args.projectId);
  },
});

// Archive a project (with ownership check)
export const archiveProject = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or access denied");
    }

    const now = Date.now();
    await ctx.db.patch(args.projectId, { status: "archived", updatedAt: now });
    return await ctx.db.get(args.projectId);
  },
});

// Unarchive a project (with ownership check)
export const unarchiveProject = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or access denied");
    }

    const now = Date.now();
    await ctx.db.patch(args.projectId, { status: "active", updatedAt: now });
    return await ctx.db.get(args.projectId);
  },
});

// Get project context including tasks and notes
export const getProjectContext = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      return null;
    }

    // Get tasks for this project
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user_project", (q) =>
        q.eq("userId", userId).eq("projectId", args.projectId),
      )
      .collect();

    // Get notes for this project
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_user_project", (q) =>
        q.eq("userId", userId).eq("projectId", args.projectId),
      )
      .collect();

    return {
      project: {
        id: project._id,
        title: project.title,
        description: project.description,
        icon: project.icon,
      },
      tasks: tasks.map((task) => ({
        id: task._id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
      })),
      notes: notes.map((note) => ({
        id: note._id,
        title: note.title,
        content: note.contentText,
      })),
    };
  },
});

// Delete a project (with ownership check)
// Note: This will orphan tasks that reference this project
export const deleteProject = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or access denied");
    }

    // Remove projectId from all tasks referencing this project
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user_project", (q) =>
        q.eq("userId", userId).eq("projectId", args.projectId),
      )
      .collect();

    for (const task of tasks) {
      await ctx.db.patch(task._id, { projectId: undefined });
    }

    // Delete the project
    await ctx.db.delete(args.projectId);

    return { success: true };
  },
});
