import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc } from "./_generated/dataModel";

// Get all tags for the current user
export const listMyTags = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Get all tags for user, sorted by usageCount desc
    const tags = await ctx.db
      .query("tags")
      .withIndex("by_user_usage", (q) => q.eq("userId", userId))
      .collect();

    return tags.sort((a, b) => b.usageCount - a.usageCount);
  },
});

// Get a single tag by ID (with ownership check)
export const getMyTag = query({
  args: {
    tagId: v.id("tags"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const tag = await ctx.db.get(args.tagId);
    if (!tag || tag.userId !== userId) {
      return null;
    }

    return tag;
  },
});

// Create a new tag for the current user
export const createTag = mutation({
  args: {
    name: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();

    // Check if tag with same name already exists for this user
    const existingTags = await ctx.db
      .query("tags")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const existingTag = existingTags.find(
      (tag) => tag.name.toLowerCase() === args.name.toLowerCase(),
    );

    if (existingTag) {
      // Return existing tag instead of creating duplicate
      return existingTag;
    }

    const tagId = await ctx.db.insert("tags", {
      userId,
      name: args.name,
      color: args.color ?? "#6366f1", // Default indigo color
      usageCount: 0,
      createdAt: now,
    });

    return await ctx.db.get(tagId);
  },
});

// Update an existing tag (with ownership check)
export const updateTag = mutation({
  args: {
    tagId: v.id("tags"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const tag = await ctx.db.get(args.tagId);
    if (!tag || tag.userId !== userId) {
      throw new Error("Tag not found or access denied");
    }

    // Build patch object with only provided fields
    const patch: Partial<Doc<"tags">> = {};

    if (args.name !== undefined) patch.name = args.name;
    if (args.color !== undefined) patch.color = args.color;

    await ctx.db.patch(args.tagId, patch);
    return await ctx.db.get(args.tagId);
  },
});

// Delete a tag (with ownership check)
// Note: This will remove the tag from all tasks
export const deleteTag = mutation({
  args: {
    tagId: v.id("tags"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const tag = await ctx.db.get(args.tagId);
    if (!tag || tag.userId !== userId) {
      throw new Error("Tag not found or access denied");
    }

    // Remove tagId from all tasks that have this tag
    // Note: This is expensive - we need to scan all user tasks
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const task of tasks) {
      if (task.tagIds.includes(args.tagId)) {
        await ctx.db.patch(task._id, {
          tagIds: task.tagIds.filter((id) => id !== args.tagId),
        });
      }
    }

    // Delete the tag
    await ctx.db.delete(args.tagId);

    return { success: true };
  },
});

// Increment tag usage count (called when tag is added to a task)
export const incrementTagUsage = mutation({
  args: {
    tagId: v.id("tags"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const tag = await ctx.db.get(args.tagId);
    if (!tag || tag.userId !== userId) {
      throw new Error("Tag not found or access denied");
    }

    await ctx.db.patch(args.tagId, {
      usageCount: tag.usageCount + 1,
    });

    return await ctx.db.get(args.tagId);
  },
});

// Decrement tag usage count (called when tag is removed from a task)
export const decrementTagUsage = mutation({
  args: {
    tagId: v.id("tags"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const tag = await ctx.db.get(args.tagId);
    if (!tag || tag.userId !== userId) {
      throw new Error("Tag not found or access denied");
    }

    await ctx.db.patch(args.tagId, {
      usageCount: Math.max(0, tag.usageCount - 1),
    });

    return await ctx.db.get(args.tagId);
  },
});
