import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc } from "./_generated/dataModel";

// Get all tasks for the current user
export const listMyTasks = query({
  args: {
    status: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    hideCompleted: v.optional(v.boolean()),
    scheduledDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Pick the best index based on filters (most specific first)
    let tasks: Doc<"tasks">[];

    if (args.status) {
      // Use status index for status filter
      tasks = await ctx.db
        .query("tasks")
        .withIndex("by_user_status", (q) =>
          q
            .eq("userId", userId)
            .eq("status", args.status as Doc<"tasks">["status"]),
        )
        .collect();
    } else if (args.projectId) {
      // Use project index for project filter
      tasks = await ctx.db
        .query("tasks")
        .withIndex("by_user_project", (q) =>
          q.eq("userId", userId).eq("projectId", args.projectId),
        )
        .collect();
    } else if (
      args.scheduledDate !== undefined &&
      args.scheduledDate !== null
    ) {
      // Use scheduled date index
      tasks = await ctx.db
        .query("tasks")
        .withIndex("by_user_scheduled", (q) =>
          q.eq("userId", userId).eq("scheduledDate", args.scheduledDate),
        )
        .collect();
    } else {
      // Default: all user tasks
      tasks = await ctx.db
        .query("tasks")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
    }

    // Apply post-query filters
    if (args.hideCompleted) {
      tasks = tasks.filter((t) => t.status !== "Completed");
    }

    if (args.scheduledDate === null) {
      // Filter for unscheduled tasks (no scheduledDate)
      tasks = tasks.filter((t) => t.scheduledDate === undefined);
    }

    // Sort by orderIndex, then by lastActiveAt desc
    return tasks.sort((a, b) => {
      if (a.orderIndex !== b.orderIndex) {
        return a.orderIndex - b.orderIndex;
      }
      return b.lastActiveAt - a.lastActiveAt;
    });
  },
});

// Get a single task by ID (with ownership check)
export const getMyTask = query({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== userId) {
      return null;
    }

    return task;
  },
});

// Create a new task for the current user
export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("Not Started"),
      v.literal("To Do"),
      v.literal("In Progress"),
      v.literal("Completed"),
    ),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    dueDate: v.optional(v.number()),
    scheduledDate: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    tagIds: v.optional(v.array(v.id("tags"))),
    estimatedDuration: v.optional(v.number()),
    energyLevel: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
    ),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();

    // Validate project ownership if projectId provided
    if (args.projectId) {
      const project = await ctx.db.get(args.projectId);
      if (!project || project.userId !== userId) {
        throw new Error("Invalid project");
      }
    }

    // Validate tag ownership if tagIds provided
    if (args.tagIds && args.tagIds.length > 0) {
      for (const tagId of args.tagIds) {
        const tag = await ctx.db.get(tagId);
        if (!tag || tag.userId !== userId) {
          throw new Error("Invalid tag");
        }
      }
    }

    const taskId = await ctx.db.insert("tasks", {
      userId,
      title: args.title,
      description: args.description,
      notes: args.notes,
      status: args.status,
      priority: args.priority,
      dueDate: args.dueDate,
      scheduledDate: args.scheduledDate,
      completionDate: args.status === "Completed" ? now : undefined,
      projectId: args.projectId,
      tagIds: args.tagIds ?? [],
      parentTaskId: undefined,
      estimatedDuration: args.estimatedDuration,
      actualDuration: undefined,
      energyLevel: args.energyLevel ?? "medium",
      context: [],
      source: "created",
      orderIndex: 0,
      lastActiveAt: now,
      streakCount: 0,
      difficulty: args.difficulty ?? "medium",
      isTemplate: false,
      aiSummary: undefined,
      aiContext: undefined,
      embedding: undefined,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(taskId);
  },
});

// Delete a task (with ownership check)
export const deleteTask = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== userId) {
      throw new Error("Task not found or access denied");
    }

    // Delete associated subtasks first
    const subtasks = await ctx.db
      .query("subtasks")
      .withIndex("by_user_task", (q) =>
        q.eq("userId", userId).eq("taskId", args.taskId),
      )
      .collect();

    for (const subtask of subtasks) {
      await ctx.db.delete(subtask._id);
    }

    // Delete the task
    await ctx.db.delete(args.taskId);

    return { success: true };
  },
});
