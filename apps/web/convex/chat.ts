import { query, mutation, internalAction, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc } from "./_generated/dataModel";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";

const USAGE_MICROS_MULTIPLIER = 1_000_000;

type MessageUsage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens?: number;
};

type CostComputationResult = {
  usage: MessageUsage;
  costUsdMicros: number;
};

type ThreadUsageTotals = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  totalCostUsdMicros: number;
};

const getUtcDayKey = (timestamp: number) =>
  new Date(timestamp).toISOString().slice(0, 10);

const toNonNegativeInteger = (value: number | undefined) => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.round(value ?? 0));
};

const normalizeUsage = (usage: MessageUsage): MessageUsage => {
  const inputTokens = toNonNegativeInteger(usage.inputTokens);
  const outputTokens = toNonNegativeInteger(usage.outputTokens);
  const computedTotalTokens = inputTokens + outputTokens;
  const totalTokens =
    usage.totalTokens === undefined
      ? computedTotalTokens
      : toNonNegativeInteger(usage.totalTokens);

  return {
    inputTokens,
    outputTokens,
    totalTokens,
  };
};

const parseUsdPerMillionToMicros = (value: string | undefined) => {
  const parsed = Number(value ?? "0");
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return Math.round(parsed * USAGE_MICROS_MULTIPLIER);
};

const computeAssistantUsageAndCost = async (
  ctx: MutationCtx,
  modelId: string,
  usage: MessageUsage,
): Promise<CostComputationResult> => {
  const normalizedUsage = normalizeUsage(usage);

  const availableModel = await ctx.db
    .query("availableModels")
    .withIndex("by_modelId", (q) => q.eq("modelId", modelId))
    .first();

  const promptMicrosPerMillion = parseUsdPerMillionToMicros(
    availableModel?.pricing?.prompt,
  );
  const completionMicrosPerMillion = parseUsdPerMillionToMicros(
    availableModel?.pricing?.completion,
  );
  const totalMicros = Math.round(
    (normalizedUsage.inputTokens * promptMicrosPerMillion +
      normalizedUsage.outputTokens * completionMicrosPerMillion) /
    USAGE_MICROS_MULTIPLIER,
  );

  return {
    usage: normalizedUsage,
    costUsdMicros: Math.max(0, totalMicros),
  };
};

const applyThreadUsageTotals = async (
  ctx: MutationCtx,
  thread: Doc<"thread">,
  usage: MessageUsage,
  costUsdMicros: number,
  now: number,
) => {
  const currentTotals =
    (
      thread as unknown as {
        usageTotals?: ThreadUsageTotals;
      }
    ).usageTotals ?? {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      totalCostUsdMicros: 0,
    };

  const nextTotals: ThreadUsageTotals = {
    inputTokens: currentTotals.inputTokens + usage.inputTokens,
    outputTokens: currentTotals.outputTokens + usage.outputTokens,
    totalTokens:
      currentTotals.totalTokens +
      (usage.totalTokens ?? usage.inputTokens + usage.outputTokens),
    totalCostUsdMicros: currentTotals.totalCostUsdMicros + costUsdMicros,
  };

  await ctx.db.patch(
    thread._id,
    {
      updatedAt: now,
      usageTotals: nextTotals,
    } as unknown as Partial<Doc<"thread">>,
  );
};

const incrementChatUsage = async (
  ctx: MutationCtx,
  userId: Id<"users">,
  now: number,
) => {
  const day = getUtcDayKey(now);

  const totals = await ctx.db
    .query("chatUsageTotals")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .first();

  if (!totals) {
    await ctx.db.insert("chatUsageTotals", {
      userId,
      messagesSent: 1,
      createdAt: now,
      updatedAt: now,
    });
  } else {
    await ctx.db.patch(totals._id, {
      messagesSent: totals.messagesSent + 1,
      updatedAt: now,
    });
  }

  const daily = await ctx.db
    .query("chatUsageDaily")
    .withIndex("by_userId_day", (q) => q.eq("userId", userId).eq("day", day))
    .first();

  if (!daily) {
    await ctx.db.insert("chatUsageDaily", {
      userId,
      day,
      messagesSent: 1,
      createdAt: now,
      updatedAt: now,
    });
  } else {
    await ctx.db.patch(daily._id, {
      messagesSent: daily.messagesSent + 1,
      updatedAt: now,
    });
  }
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * List all threads for the current user
 * Returns threads sorted by pinned first, then by updatedAt descending
 * Excludes soft-deleted threads (deletedAt is null/undefined)
 */
export const listThreads = query({
  args: {
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Get all threads for the user, excluding soft-deleted ones
    const threads = await ctx.db
      .query("thread")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    // Filter by projectId if provided
    let filteredThreads = threads;
    if (args.projectId) {
      filteredThreads = threads.filter((t) => t.projectId === args.projectId);
    }

    // Sort: pinned first, then by updatedAt descending
    return filteredThreads.sort((a, b) => {
      const aPinned = a.pinned ?? false;
      const bPinned = b.pinned ?? false;
      if (aPinned !== bPinned) {
        return aPinned ? -1 : 1;
      }
      return b.updatedAt - a.updatedAt;
    });
  },
});

/**
 * Get a single thread by threadId
 * Returns null if thread doesn't exist, is soft-deleted, or doesn't belong to user
 */
export const getThread = query({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const thread = await ctx.db
      .query("thread")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!thread || thread.deletedAt !== undefined) {
      return null;
    }

    return thread;
  },
});

/**
 * List all messages for a specific thread
 * Returns messages sorted by createdAt ascending (oldest first)
 */
export const listMessages = query({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Verify thread exists and belongs to user
    const thread = await ctx.db
      .query("thread")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!thread || thread.deletedAt !== undefined) {
      return [];
    }

    // Get all messages for the thread
    const messages = await ctx.db
      .query("threadMessages")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    // Sort by createdAt ascending (oldest first)
    return messages.sort((a, b) => a.createdAt - b.createdAt);
  },
});

/**
 * Get chat bootstrap data for the current user
 * Returns user preferences (including default AI model) and available models
 */
export const getChatBootstrap = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // Get user preferences (includes defaultAIModel)
    const preferences = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // Get all available models
    const availableModels = await ctx.db.query("availableModels").collect();

    return {
      preferences,
      availableModels: availableModels.sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    };
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new thread
 * Generates a unique threadId and sets initial timestamp
 */
export const createThread = mutation({
  args: {
    threadId: v.optional(v.string()),
    title: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    model: v.optional(v.string()),
    interface: v.optional(v.string()),
    scope: v.optional(v.union(v.literal("workspace"), v.literal("project"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Validate project ownership if projectId provided
    if (args.projectId) {
      const project = await ctx.db.get(args.projectId);
      if (!project || project.userId !== userId) {
        throw new Error("Invalid project");
      }
    }

    const now = Date.now();
    const threadId =
      args.threadId ??
      `thread_${now}_${Math.random().toString(36).substring(2, 9)}`;

    if (args.threadId) {
      const threadIdToCheck = args.threadId;
      const existing = await ctx.db
        .query("thread")
        .withIndex("by_threadId", (q) => q.eq("threadId", threadIdToCheck))
        .first();

      if (existing) {
        throw new Error("Thread already exists");
      }
    }

    const threadId_db = await ctx.db.insert("thread", {
      userId,
      threadId,
      title: args.title ?? "Untitled chat",
      snippet: undefined,
      pinned: false,
      projectId: args.projectId,
      model: args.model,
      interface: args.interface,
      scope: args.scope ?? (args.projectId ? "project" : "workspace"),
      deletedAt: undefined,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(threadId_db);
  },
});

/**
 * Append a message to a thread
 * Creates a new message entry and updates thread's updatedAt timestamp
 */
export const appendMessage = mutation({
  args: {
    threadId: v.string(),
    messageId: v.string(),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system"),
    ),
    model: v.string(),
    parts: v.any(),
    usage: v.optional(
      v.object({
        inputTokens: v.number(),
        outputTokens: v.number(),
        totalTokens: v.optional(v.number()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify thread exists and belongs to user
    const thread = await ctx.db
      .query("thread")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!thread || thread.deletedAt !== undefined) {
      throw new Error("Thread not found or access denied");
    }

    const assistantUsage = args.role === "assistant" ? args.usage : undefined;

    const existingMessage = await ctx.db
      .query("threadMessages")
      .withIndex("by_messageId", (q) => q.eq("messageId", args.messageId))
      .first();

    if (existingMessage) {
      if (
        existingMessage.userId !== userId ||
        existingMessage.threadId !== args.threadId
      ) {
        throw new Error("Message ID conflict");
      }

      if (
        assistantUsage !== undefined &&
        existingMessage.usage === undefined &&
        existingMessage.costUsdMicros === undefined
      ) {
        const now = Date.now();
        const usageAndCost = await computeAssistantUsageAndCost(
          ctx,
          args.model,
          assistantUsage,
        );

        await ctx.db.patch(
          existingMessage._id,
          {
            usage: usageAndCost.usage,
            costUsdMicros: usageAndCost.costUsdMicros,
            updatedAt: now,
          } as unknown as Partial<Doc<"threadMessages">>,
        );

        await applyThreadUsageTotals(
          ctx,
          thread,
          usageAndCost.usage,
          usageAndCost.costUsdMicros,
          now,
        );
      }

      return { success: true, deduped: true };
    }

    const now = Date.now();
    let usageAndCost: CostComputationResult | null = null;
    if (assistantUsage !== undefined) {
      usageAndCost = await computeAssistantUsageAndCost(
        ctx,
        args.model,
        assistantUsage,
      );
    }

    // Insert the message
    await ctx.db.insert("threadMessages", {
      userId,
      threadId: args.threadId,
      messageId: args.messageId ?? crypto.randomUUID(),
      role: args.role,
      model: args.model,
      content: args.parts, // Store parts array in content field
      usage: usageAndCost?.usage,
      costUsdMicros: usageAndCost?.costUsdMicros,
      createdAt: now,
      updatedAt: now,
    });

    if (args.role === "user") {
      // Preserve existing "messages sent" counters for settings usage metrics.
      await incrementChatUsage(ctx, userId, now);
    }

    if (usageAndCost) {
      await applyThreadUsageTotals(
        ctx,
        thread,
        usageAndCost.usage,
        usageAndCost.costUsdMicros,
        now,
      );
    } else {
      // Update thread's updatedAt timestamp for non-tracked message roles.
      await ctx.db.patch(thread._id, {
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

/**
 * Update a thread's title
 */
export const updateThreadTitle = mutation({
  args: {
    threadId: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const thread = await ctx.db
      .query("thread")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!thread || thread.deletedAt !== undefined) {
      throw new Error("Thread not found or access denied");
    }

    await ctx.db.patch(thread._id, {
      title: args.title,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(thread._id);
  },
});

/**
 * Set a thread's pinned status
 */
export const setThreadPinned = mutation({
  args: {
    threadId: v.string(),
    pinned: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const thread = await ctx.db
      .query("thread")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!thread || thread.deletedAt !== undefined) {
      throw new Error("Thread not found or access denied");
    }

    await ctx.db.patch(thread._id, {
      pinned: args.pinned,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(thread._id);
  },
});

/**
 * Soft delete a thread by setting deletedAt timestamp
 * Does not actually delete the thread from the database
 */
export const softDeleteThread = mutation({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const thread = await ctx.db
      .query("thread")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!thread || thread.deletedAt !== undefined) {
      throw new Error("Thread not found or access denied");
    }

    await ctx.db.patch(thread._id, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Set the AI model and interface for a thread
 */
export const setThreadModel = mutation({
  args: {
    threadId: v.string(),
    model: v.string(),
    interface: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const thread = await ctx.db
      .query("thread")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!thread || thread.deletedAt !== undefined) {
      throw new Error("Thread not found or access denied");
    }

    const patch: { model: string; interface?: string; updatedAt: number } = {
      model: args.model,
      updatedAt: Date.now(),
    }
    if (args.interface !== undefined) {
      patch.interface = args.interface
    }

    await ctx.db.patch(thread._id, patch);

    return await ctx.db.get(thread._id);
  },
});

/**
 * Set the scope for a thread (workspace or project)
 */
export const setThreadScope = mutation({
  args: {
    threadId: v.string(),
    scope: v.union(v.literal("workspace"), v.literal("project")),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const thread = await ctx.db
      .query("thread")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!thread || thread.deletedAt !== undefined) {
      throw new Error("Thread not found or access denied");
    }

    // Validate project ownership if projectId provided
    if (args.projectId) {
      const project = await ctx.db.get(args.projectId);
      if (!project || project.userId !== userId) {
        throw new Error("Invalid project");
      }
    }

    // If scope is workspace, clear projectId
    // If scope is project, projectId must be provided
    const patch: Partial<Doc<"thread">> = {
      scope: args.scope,
      updatedAt: Date.now(),
    };

    if (args.scope === "workspace") {
      patch.projectId = undefined;
    } else if (args.scope === "project") {
      if (!args.projectId) {
        throw new Error("projectId is required when scope is 'project'");
      }
      patch.projectId = args.projectId;
    }

    await ctx.db.patch(thread._id, patch);

    return await ctx.db.get(thread._id);
  },
});

/**
 * Update thread snippet and timestamps
 * Useful for updating the preview text shown in thread lists
 */
export const updateThreadSnippetAndTimestamps = mutation({
  args: {
    threadId: v.string(),
    snippet: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const thread = await ctx.db
      .query("thread")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!thread || thread.deletedAt !== undefined) {
      throw new Error("Thread not found or access denied");
    }

    const patch: Partial<Doc<"thread">> = {
      updatedAt: args.updatedAt ?? Date.now(),
    };

    if (args.snippet !== undefined) {
      patch.snippet = args.snippet;
    }

    await ctx.db.patch(thread._id, patch);

    return await ctx.db.get(thread._id);
  },
});

export const setThreadSummary = mutation({
  args: {
    threadId: v.string(),
    summary: v.object({
      schemaVersion: v.number(),
      summaryText: v.string(),
      summarizedThroughMessageId: v.string(),
      updatedAt: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error("Not authenticated")
    }

    const thread = await ctx.db
      .query("thread")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first()

    if (!thread || thread.deletedAt !== undefined) {
      throw new Error("Thread not found or access denied")
    }

    await ctx.db.patch(thread._id, {
      summary: args.summary,
      updatedAt: Date.now(),
    })

    return await ctx.db.get(thread._id)
  },
})

export const getAllThreads = internalQuery({
  handler(ctx) {
    return ctx.db.query("thread").filter((q) => q.neq(q.field("deletedAt"), undefined)
    ).collect();
  }
})

export const deleteThread = internalMutation({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.threadId as Id<"thread">);
    return true
  }
})

export const deleteThreadMessages = internalMutation({
  args: {
    ownerThreadId: v.string(),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db.query("threadMessages").withIndex("by_threadId", (q) => q.eq("threadId", args.ownerThreadId)).collect();
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
    return true
  }
})


export const deleteOldThreadsAndMessages = internalAction({
  handler: async (ctx) => {
    const oldThreads = await ctx.runQuery(internal.chat.getAllThreads)

    for (const thread of oldThreads) {
      await ctx.runMutation(internal.chat.deleteThreadMessages, { ownerThreadId: thread.threadId });
      await ctx.runMutation(internal.chat.deleteThread, { threadId: thread._id });
    }
    return true
  },
})
