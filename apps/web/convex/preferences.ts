import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get current user's preferences (no args - derived from auth context)
export const getMyPreferences = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const preferences = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return preferences;
  },
});

// Update current user's preferences (no userId arg - derived from auth context)
export const updateMyPreferences = mutation({
  args: {
    defaultAIModel: v.optional(
      v.object({
        modelId: v.string(),
        name: v.string(),
      }),
    ),
    taskDefaultView: v.optional(
      v.union(v.literal("board"), v.literal("todayPlusBoard")),
    ),
    hideCompletedTasks: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existingPreferences = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // Build patch object with only provided fields
    const patch: {
      defaultAIModel?: typeof args.defaultAIModel;
      taskDefaultView?: typeof args.taskDefaultView;
      hideCompletedTasks?: typeof args.hideCompletedTasks;
    } = {};
    if (args.defaultAIModel !== undefined) {
      patch.defaultAIModel = args.defaultAIModel;
    }
    if (args.taskDefaultView !== undefined) {
      patch.taskDefaultView = args.taskDefaultView;
    }
    if (args.hideCompletedTasks !== undefined) {
      patch.hideCompletedTasks = args.hideCompletedTasks;
    }

    if (existingPreferences) {
      // Update existing preferences (partial update)
      return await ctx.db.patch(existingPreferences._id, patch);
    } else {
      // Create new preferences with defaults
      const preferencesId = await ctx.db.insert("userPreferences", {
        userId,
        taskDefaultView: "board",
        hideCompletedTasks: false,
        ...patch,
      });
      return await ctx.db.get(preferencesId);
    }
  },
});
