import { v } from "convex/values";
import { query } from "./_generated/server";
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
