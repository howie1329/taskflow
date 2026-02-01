import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get current user's profile (no args - derived from auth context)
export const getMyProfile = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return profile;
  },
});

// Update current user's profile (no userId arg - derived from auth context)
export const updateMyProfile = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      // Update existing profile
      return await ctx.db.patch(existingProfile._id, {
        firstName: args.firstName,
        lastName: args.lastName,
        email: args.email,
      });
    } else {
      // Create new profile
      const profileId = await ctx.db.insert("userProfiles", {
        userId,
        firstName: args.firstName,
        lastName: args.lastName,
        email: args.email,
      });
      return await ctx.db.get(profileId);
    }
  },
});
