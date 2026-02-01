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
    defaultAIModel: v.string(),
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

    if (existingPreferences) {
      // Update existing preferences
      return await ctx.db.patch(existingPreferences._id, {
        defaultAIModel: args.defaultAIModel,
      });
    } else {
      // Create new preferences
      const preferencesId = await ctx.db.insert("userPreferences", {
        userId,
        defaultAIModel: args.defaultAIModel,
      });
      return await ctx.db.get(preferencesId);
    }
  },
});
