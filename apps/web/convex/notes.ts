import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { getAuthUserId } from "@convex-dev/auth/server"

const reviewerValue = v.object({
  schemaVersion: v.number(),
  contentSignature: v.string(),
  summary: v.string(),
  noteType: v.string(),
  scores: v.object({
    clarity: v.number(),
    structure: v.number(),
    scannability: v.number(),
    actionability: v.number(),
  }),
  topIssues: v.array(
    v.object({
      title: v.string(),
      detail: v.string(),
      severity: v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
      ),
    }),
  ),
  suggestions: v.array(
    v.object({
      id: v.string(),
      title: v.string(),
      detail: v.string(),
      kind: v.union(
        v.literal("clarity"),
        v.literal("structure"),
        v.literal("scannability"),
        v.literal("actionability"),
      ),
    }),
  ),
  actionItems: v.array(v.string()),
  openQuestions: v.array(v.string()),
  updatedAt: v.number(),
})

export const listMyNotes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return []
    }

    return await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()
  },
})

export const getMyNote = query({
  args: {
    noteId: v.id("notes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return null
    }

    const note = await ctx.db.get(args.noteId)
    if (!note || note.userId !== userId) {
      return null
    }

    return note
  },
})

export const createNote = mutation({
  args: {
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    contentText: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error("Not authenticated")
    }

    if (args.projectId) {
      const project = await ctx.db.get(args.projectId)
      if (!project || project.userId !== userId) {
        throw new Error("Invalid project")
      }
    }

    const now = Date.now()

    const noteId = await ctx.db.insert("notes", {
      userId,
      title: args.title ?? "",
      content: args.content ?? "",
      contentText: args.contentText ?? "",
      pinned: false,
      projectId: args.projectId,
      createdAt: now,
      updatedAt: now,
    })

    return await ctx.db.get(noteId)
  },
})

export const updateNote = mutation({
  args: {
    noteId: v.id("notes"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    contentText: v.optional(v.string()),
    pinned: v.optional(v.boolean()),
    projectId: v.optional(v.union(v.id("projects"), v.null())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error("Not authenticated")
    }

    const note = await ctx.db.get(args.noteId)
    if (!note || note.userId !== userId) {
      throw new Error("Note not found")
    }

    if (args.projectId) {
      const project = await ctx.db.get(args.projectId)
      if (!project || project.userId !== userId) {
        throw new Error("Invalid project")
      }
    }

    const update = {
      title: args.title ?? note.title,
      content: args.content ?? note.content,
      contentText: args.contentText ?? note.contentText,
      pinned: args.pinned ?? note.pinned,
      projectId:
        args.projectId === undefined
          ? note.projectId
          : args.projectId === null
            ? undefined
            : args.projectId,
      updatedAt: Date.now(),
    }

    await ctx.db.patch(args.noteId, update)
    return await ctx.db.get(args.noteId)
  },
})

export const deleteNote = mutation({
  args: {
    noteId: v.id("notes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error("Not authenticated")
    }

    const note = await ctx.db.get(args.noteId)
    if (!note || note.userId !== userId) {
      throw new Error("Note not found")
    }

    await ctx.db.delete(args.noteId)
    return { success: true }
  },
})

export const setNoteReviewer = mutation({
  args: {
    noteId: v.id("notes"),
    reviewer: reviewerValue,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error("Not authenticated")
    }

    const note = await ctx.db.get(args.noteId)
    if (!note || note.userId !== userId) {
      throw new Error("Note not found")
    }

    await ctx.db.patch(args.noteId, {
      reviewer: args.reviewer,
    })

    return await ctx.db.get(args.noteId)
  },
})
