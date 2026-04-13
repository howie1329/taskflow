import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc } from "./_generated/dataModel";
import { DEFAULT_PROJECT_COLOR, DEFAULT_PROJECT_ICON } from "./constants";

const inboxStatus = v.union(v.literal("open"), v.literal("archived"));

const getInboxItemForUser = async (
  ctx: {
    db: {
      get: (id: Doc<"inboxItems">["_id"]) => Promise<Doc<"inboxItems"> | null>;
    };
  },
  userId: Doc<"inboxItems">["userId"],
  inboxItemId: Doc<"inboxItems">["_id"],
) => {
  const item = await ctx.db.get(inboxItemId);
  if (!item || item.userId !== userId) {
    throw new Error("Inbox item not found or access denied");
  }
  return item;
};

export const listMyInboxItems = query({
  args: {
    status: v.optional(inboxStatus),
    searchQuery: v.optional(v.string()),
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { items: [], nextCursor: null };
    }

    const limit = args.limit ?? 50;
    let items: Doc<"inboxItems">[];

    // If search query is provided, use search index
    if (args.searchQuery && args.searchQuery.trim()) {
      const searchResults = await ctx.db
        .query("inboxItems")
        .withSearchIndex("search_content", (q) => {
          const query = q
            .search("content", args.searchQuery!)
            .eq("userId", userId);
          return query;
        })
        .take(limit + 1);

      // Filter by status client-side if needed
      items = args.status
        ? searchResults.filter((item) => item.status === args.status)
        : searchResults;
    } else if (args.status) {
      // Use status index for filtered queries
      const status = args.status;
      items = await ctx.db
        .query("inboxItems")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", userId).eq("status", status),
        )
        .order("desc")
        .take(limit + 1);
    } else {
      // Use user index for all items
      items = await ctx.db
        .query("inboxItems")
        .withIndex("by_user_createdAt", (q) => q.eq("userId", userId))
        .order("desc")
        .take(limit + 1);
    }

    // Check if there are more items
    let nextCursor: string | null = null;
    if (items.length > limit) {
      const lastItem = items[limit - 1];
      nextCursor = lastItem._id;
      items = items.slice(0, limit);
    }

    return { items, nextCursor };
  },
});

export const getInboxCounts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { open: 0, archived: 0 };
    }

    const [openItems, archivedItems] = await Promise.all([
      ctx.db
        .query("inboxItems")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", userId).eq("status", "open"),
        )
        .collect(),
      ctx.db
        .query("inboxItems")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", userId).eq("status", "archived"),
        )
        .collect(),
    ]);

    return { open: openItems.length, archived: archivedItems.length };
  },
});

export const getMyInboxItem = query({
  args: {
    inboxItemId: v.id("inboxItems"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const item = await ctx.db.get(args.inboxItemId);
    if (!item || item.userId !== userId) {
      return null;
    }

    return item;
  },
});

export const createInboxItem = mutation({
  args: {
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const trimmed = args.content.trim();
    if (!trimmed) {
      throw new Error("Content cannot be empty");
    }

    const now = Date.now();
    const inboxItemId = await ctx.db.insert("inboxItems", {
      userId,
      content: trimmed,
      status: "open",
      labels: [],
      source: "manual",
      metadata: {},
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(inboxItemId);
  },
});

export const updateInboxItem = mutation({
  args: {
    inboxItemId: v.id("inboxItems"),
    content: v.optional(v.string()),
    status: v.optional(inboxStatus),
    labels: v.optional(v.union(v.array(v.string()), v.null())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    await getInboxItemForUser(ctx, userId, args.inboxItemId);

    const now = Date.now();
    const patch: Partial<Doc<"inboxItems">> = {
      updatedAt: now,
    };

    if (args.content !== undefined) {
      const trimmed = args.content.trim();
      if (!trimmed) {
        throw new Error("Content cannot be empty");
      }
      patch.content = trimmed;
    }

    if (args.status !== undefined) {
      patch.status = args.status;
    }

    if (args.labels !== undefined) {
      patch.labels = args.labels === null ? undefined : args.labels;
    }

    await ctx.db.patch(args.inboxItemId, patch);
    return await ctx.db.get(args.inboxItemId);
  },
});

export const archiveInboxItem = mutation({
  args: {
    inboxItemId: v.id("inboxItems"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    await getInboxItemForUser(ctx, userId, args.inboxItemId);
    await ctx.db.patch(args.inboxItemId, {
      status: "archived",
      updatedAt: now,
    });

    return await ctx.db.get(args.inboxItemId);
  },
});

export const unarchiveInboxItem = mutation({
  args: {
    inboxItemId: v.id("inboxItems"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    await getInboxItemForUser(ctx, userId, args.inboxItemId);
    await ctx.db.patch(args.inboxItemId, { status: "open", updatedAt: now });

    return await ctx.db.get(args.inboxItemId);
  },
});

export const deleteInboxItem = mutation({
  args: {
    inboxItemId: v.id("inboxItems"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    await getInboxItemForUser(ctx, userId, args.inboxItemId);
    await ctx.db.delete(args.inboxItemId);
    return { success: true };
  },
});

const getDefaultTaskTitle = (content: string) => {
  const firstLine = content.split("\n").find((line) => line.trim());
  if (firstLine) {
    return firstLine.trim();
  }
  return content.length > 80 ? `${content.slice(0, 77).trim()}...` : content;
};

export const convertInboxItemToTask = mutation({
  args: {
    inboxItemId: v.id("inboxItems"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const item = await getInboxItemForUser(ctx, userId, args.inboxItemId);
    const now = Date.now();

    const content = item.content.trim();
    const title = args.title?.trim() || getDefaultTaskTitle(content);
    const description =
      args.description?.trim() ||
      (content.includes("\n") ? content : undefined);

    const taskId = await ctx.db.insert("tasks", {
      userId,
      title,
      description,
      notes: undefined,
      status: "Not Started",
      priority: "low",
      dueDate: undefined,
      scheduledDate: undefined,
      completionDate: undefined,
      projectId: undefined,
      tagIds: [],
      parentTaskId: undefined,
      estimatedDuration: undefined,
      actualDuration: undefined,
      energyLevel: "medium",
      context: [],
      source: "inbox",
      orderIndex: 0,
      lastActiveAt: now,
      streakCount: 0,
      difficulty: "medium",
      isTemplate: false,
      aiSummary: undefined,
      aiContext: {},
      embedding: undefined,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(item._id, { status: "archived", updatedAt: now });

    return await ctx.db.get(taskId);
  },
});

export const convertInboxItemToProject = mutation({
  args: {
    inboxItemId: v.id("inboxItems"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const item = await getInboxItemForUser(ctx, userId, args.inboxItemId);
    const now = Date.now();

    const content = item.content.trim();
    const title = args.title?.trim() || getDefaultTaskTitle(content);
    const description =
      args.description?.trim() ||
      (content.includes("\n") ? content : undefined);

    const projectId = await ctx.db.insert("projects", {
      userId,
      title,
      description,
      status: "active",
      color: DEFAULT_PROJECT_COLOR,
      icon: DEFAULT_PROJECT_ICON,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(item._id, { status: "archived", updatedAt: now });

    return await ctx.db.get(projectId);
  },
});
