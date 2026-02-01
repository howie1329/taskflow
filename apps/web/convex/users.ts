import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getViewer = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // Get auth identity
    const identity = await ctx.auth.getUserIdentity();

    // Get profile from userProfiles table
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // Get preferences from userPreferences table
    const preferences = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return {
      userId,
      identityEmail: identity?.email || null,
      identityName: identity?.name || null,
      profile,
      preferences,
    };
  },
});

export const ensureViewerInitialized = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get auth identity for prefilling
    const identity = await ctx.auth.getUserIdentity();
    const identityEmail = identity?.email || "";

    // Check if profile exists
    let profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // Create profile if missing
    if (!profile) {
      const profileId = await ctx.db.insert("userProfiles", {
        userId,
        firstName: "",
        lastName: "",
        email: identityEmail,
      });
      profile = await ctx.db.get(profileId);
    }

    // Check if preferences exist
    let preferences = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // Create preferences if missing (no default model - models being rebuilt)
    if (!preferences) {
      const preferencesId = await ctx.db.insert("userPreferences", {
        userId,
        taskDefaultView: "board",
        hideCompletedTasks: false,
        // defaultAIModel is optional - will be set later when models system is rebuilt
      });
      preferences = await ctx.db.get(preferencesId);
    }

    return { profile, preferences };
  },
});
