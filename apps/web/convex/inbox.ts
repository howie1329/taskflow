import { v } from "convex/values"
import { query, mutation } from "./_generated/server"
import { getAuthUserId } from "@convex-dev/auth/server"
import type { Doc } from "./_generated/dataModel"

const inboxStatus = v.union(v.literal("open"), v.literal("archived"))

const getInboxItemForUser = async (
  ctx: { db: { get: (id: Doc<"inboxItems">["_id"]) => Promise<Doc<"inboxItems"> | null> } },
  userId: Doc<"inboxItems">["userId"],
  inboxItemId: Doc<"inboxItems">["_id"],
) => {
  const item = await ctx.db.get(inboxItemId)
  if (!item || item.userId !== userId) {
    throw new Error("Inbox item not found or access denied")
  }
  return item
}

export const listMyInboxItems = query({
  args: {
    status: v.optional(inboxStatus),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return []
    }

    let items: Doc<"inboxItems">[]

    if (args.status) {
      items = await ctx.db
        .query("inboxItems")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", userId).eq("status", args.status),
        )
        .collect()
    } else {
      items = await ctx.db
        .query("inboxItems")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect()
    }

    return items.sort((a, b) => b.createdAt - a.createdAt)
  },
})

export const createInboxItem = mutation({
  args: {
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error("Not authenticated")
    }

    const trimmed = args.content.trim()
    if (!trimmed) {
      throw new Error("Content cannot be empty")
    }

    const now = Date.now()
    const inboxItemId = await ctx.db.insert("inboxItems", {
      userId,
      content: trimmed,
      status: "open",
      labels: [],
      source: "manual",
      metadata: {},
      createdAt: now,
      updatedAt: now,
    })

    return await ctx.db.get(inboxItemId)
  },
})

export const archiveInboxItem = mutation({
  args: {
    inboxItemId: v.id("inboxItems"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error("Not authenticated")
    }

    const now = Date.now()
    await getInboxItemForUser(ctx, userId, args.inboxItemId)
    await ctx.db.patch(args.inboxItemId, { status: "archived", updatedAt: now })

    return await ctx.db.get(args.inboxItemId)
  },
})

export const unarchiveInboxItem = mutation({
  args: {
    inboxItemId: v.id("inboxItems"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error("Not authenticated")
    }

    const now = Date.now()
    await getInboxItemForUser(ctx, userId, args.inboxItemId)
    await ctx.db.patch(args.inboxItemId, { status: "open", updatedAt: now })

    return await ctx.db.get(args.inboxItemId)
  },
})

export const deleteInboxItem = mutation({
  args: {
    inboxItemId: v.id("inboxItems"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error("Not authenticated")
    }

    await getInboxItemForUser(ctx, userId, args.inboxItemId)
    await ctx.db.delete(args.inboxItemId)
    return { success: true }
  },
})

const getDefaultTaskTitle = (content: string) => {
  const firstLine = content.split("\n").find((line) => line.trim())
  if (firstLine) {
    return firstLine.trim()
  }
  return content.length > 80 ? `${content.slice(0, 77).trim()}...` : content
}

export const convertInboxItemToTask = mutation({
  args: {
    inboxItemId: v.id("inboxItems"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error("Not authenticated")
    }

    const item = await getInboxItemForUser(ctx, userId, args.inboxItemId)
    const now = Date.now()

    const content = item.content.trim()
    const title = args.title?.trim() || getDefaultTaskTitle(content)
    const description =
      args.description?.trim() ||
      (content.includes("\n") ? content : undefined)

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
    })

    await ctx.db.patch(item._id, { status: "archived", updatedAt: now })

    return await ctx.db.get(taskId)
  },
})

export const convertInboxItemToProject = mutation({
  args: {
    inboxItemId: v.id("inboxItems"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error("Not authenticated")
    }

    const item = await getInboxItemForUser(ctx, userId, args.inboxItemId)
    const now = Date.now()

    const content = item.content.trim()
    const title = args.title?.trim() || getDefaultTaskTitle(content)
    const description =
      args.description?.trim() ||
      (content.includes("\n") ? content : undefined)

    const projectId = await ctx.db.insert("projects", {
      userId,
      title,
      description,
      status: "active",
      color: "#6366f1",
      icon: "📁",
      createdAt: now,
      updatedAt: now,
    })

    await ctx.db.patch(item._id, { status: "archived", updatedAt: now })

    return await ctx.db.get(projectId)
  },
})
