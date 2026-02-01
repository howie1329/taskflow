import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc } from "./_generated/dataModel";

// Get all subtasks for a specific task
export const listMySubtasks = query({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Verify task ownership
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== userId) {
      return [];
    }

    // Get all subtasks for this task
    const subtasks = await ctx.db
      .query("subtasks")
      .withIndex("by_user_task", (q) =>
        q.eq("userId", userId).eq("taskId", args.taskId),
      )
      .collect();

    // Sort by orderIndex
    return subtasks.sort((a, b) => a.orderIndex - b.orderIndex);
  },
});

// Create a new subtask for a task
export const createSubtask = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify task ownership
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== userId) {
      throw new Error("Task not found or access denied");
    }

    const now = Date.now();

    // Get current max orderIndex for this task
    const existingSubtasks = await ctx.db
      .query("subtasks")
      .withIndex("by_user_task", (q) =>
        q.eq("userId", userId).eq("taskId", args.taskId),
      )
      .collect();

    const maxOrder = existingSubtasks.reduce(
      (max, s) => Math.max(max, s.orderIndex),
      -1,
    );

    const subtaskId = await ctx.db.insert("subtasks", {
      userId,
      taskId: args.taskId,
      title: args.title,
      isComplete: false,
      orderIndex: maxOrder + 1,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(subtaskId);
  },
});

// Update a subtask (title or completion status)
export const updateSubtask = mutation({
  args: {
    subtaskId: v.id("subtasks"),
    title: v.optional(v.string()),
    isComplete: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const subtask = await ctx.db.get(args.subtaskId);
    if (!subtask || subtask.userId !== userId) {
      throw new Error("Subtask not found or access denied");
    }

    const now = Date.now();

    const patch: Partial<Doc<"subtasks">> = {
      updatedAt: now,
    };

    if (args.title !== undefined) patch.title = args.title;
    if (args.isComplete !== undefined) patch.isComplete = args.isComplete;

    await ctx.db.patch(args.subtaskId, patch);
    return await ctx.db.get(args.subtaskId);
  },
});

// Toggle subtask completion status
export const toggleSubtask = mutation({
  args: {
    subtaskId: v.id("subtasks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const subtask = await ctx.db.get(args.subtaskId);
    if (!subtask || subtask.userId !== userId) {
      throw new Error("Subtask not found or access denied");
    }

    const now = Date.now();

    await ctx.db.patch(args.subtaskId, {
      isComplete: !subtask.isComplete,
      updatedAt: now,
    });

    return await ctx.db.get(args.subtaskId);
  },
});

// Delete a subtask
export const deleteSubtask = mutation({
  args: {
    subtaskId: v.id("subtasks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const subtask = await ctx.db.get(args.subtaskId);
    if (!subtask || subtask.userId !== userId) {
      throw new Error("Subtask not found or access denied");
    }

    await ctx.db.delete(args.subtaskId);
    return { success: true };
  },
});

// Bulk update subtask order
export const reorderSubtasks = mutation({
  args: {
    updates: v.array(
      v.object({
        subtaskId: v.id("subtasks"),
        orderIndex: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();

    for (const update of args.updates) {
      const subtask = await ctx.db.get(update.subtaskId);
      if (!subtask || subtask.userId !== userId) {
        throw new Error("Subtask not found or access denied");
      }

      await ctx.db.patch(update.subtaskId, {
        orderIndex: update.orderIndex,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});
