import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const schema = defineSchema({
  ...authTables,
  baseModels: defineTable({
    modelId: v.string(),
    interface: v.optional(v.string()),
  }).index("by_modelId", ["modelId"]),
  thread: defineTable({
    userId: v.string(),
    threadId: v.string(),
    title: v.string(),
    snippet: v.optional(v.string()),
    pinned: v.optional(v.boolean()),
    projectId: v.optional(v.id("projects")),
    model: v.optional(v.string()),
    interface: v.optional(v.string()),
    scope: v.optional(v.union(v.literal("workspace"), v.literal("project"))),
    deletedAt: v.optional(v.number()),
    daytona: v.optional(
      v.object({
        repoUrl: v.string(),
        sandboxId: v.optional(v.string()),
        status: v.union(
          v.literal("idle"),
          v.literal("provisioning"),
          v.literal("ready"),
          v.literal("stopped"),
          v.literal("failed"),
        ),
        cloneStatus: v.union(
          v.literal("not_started"),
          v.literal("running"),
          v.literal("succeeded"),
          v.literal("failed"),
        ),
        createdAt: v.number(),
        updatedAt: v.number(),
        errorMessage: v.optional(v.string()),
      }),
    ),
    summary: v.optional(
      v.object({
        schemaVersion: v.number(),
        summaryText: v.string(),
        summarizedThroughMessageId: v.string(),
        updatedAt: v.number(),
        // Context compaction v1: structured state + metadata
        threadState: v.optional(
          v.object({
            activeGoal: v.optional(v.string()),
            currentTopic: v.optional(v.string()),
            importantFacts: v.array(v.string()),
            decisions: v.array(v.string()),
            unresolvedItems: v.array(v.string()),
            referencedEntities: v.array(v.string()),
            userPreferences: v.array(v.string()),
            recentToolFindings: v.array(v.string()),
            warningsOrRisks: v.array(v.string()),
          }),
        ),
        compactionMetadata: v.optional(
          v.object({
            lastCompactedAt: v.number(),
            lastCompactedMessageId: v.string(),
            messageCountAtCompaction: v.number(),
            tokenEstimateAtCompaction: v.optional(v.number()),
          }),
        ),
      }),
    ),
    usageTotals: v.optional(
      v.object({
        inputTokens: v.number(),
        outputTokens: v.number(),
        totalTokens: v.number(),
        totalCostUsdMicros: v.number(),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_threadId", ["threadId"])
    .index("by_userId_deletedAt", ["userId", "deletedAt"]),
  threadMessages: defineTable({
    userId: v.string(),
    threadId: v.string(),
    messageId: v.string(),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system"),
    ),
    model: v.string(),
    content: v.any(),
    usage: v.optional(
      v.object({
        inputTokens: v.number(),
        outputTokens: v.number(),
        totalTokens: v.optional(v.number()),
      }),
    ),
    costUsdMicros: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_threadId", ["threadId"])
    .index("by_messageId", ["messageId"]),
  availableModels: defineTable({
    modelId: v.string(),
    canonicalSlug: v.optional(v.string()),
    provider: v.optional(v.string()),
    interface: v.optional(v.string()),
    name: v.string(),
    description: v.string(),
    pricing: v.object({
      prompt: v.string(),
      completion: v.string(),
    }),
    contextLength: v.optional(v.number()),
    maxCompletionTokens: v.optional(v.number()),
    modality: v.optional(v.string()),
    inputModalities: v.optional(v.array(v.string())),
    outputModalities: v.optional(v.array(v.string())),
    supportedParameters: v.optional(v.array(v.string())),
    syncedAt: v.number(),
  }).index("by_modelId", ["modelId"]),
  chatUsageTotals: defineTable({
    userId: v.id("users"),
    messagesSent: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),
  chatUsageDaily: defineTable({
    userId: v.id("users"),
    day: v.string(),
    messagesSent: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId_day", ["userId", "day"])
    .index("by_userId", ["userId"]),
  // User identity information
  userProfiles: defineTable({
    userId: v.id("users"), // Reference to auth user
    firstName: v.string(), // Max 50 chars
    lastName: v.string(), // Max 50 chars
    email: v.string(), // Email address
    // Future: avatarUrl, bio, timezone, language
  }).index("by_user", ["userId"]),

  // User preferences and settings
  userPreferences: defineTable({
    userId: v.id("users"), // Reference to auth user
    defaultAIModel: v.optional(
      v.object({
        modelId: v.string(),
        name: v.string(),
      }),
    ),
    onboardingCompletedAt: v.optional(v.number()),
    onboardingVersion: v.optional(v.string()),
    notificationsEnabled: v.optional(v.boolean()),
    // Task view preference (board | todayPlusBoard)
    taskDefaultView: v.optional(
      v.union(v.literal("board"), v.literal("todayPlusBoard")),
    ),
    // Hide completed tasks in board/list views
    hideCompletedTasks: v.optional(v.boolean()),
    // AI Chat visibility preferences
    aiChatShowActions: v.optional(v.boolean()),
    aiChatShowToolDetails: v.optional(v.boolean()),
    aiChatShowReasoning: v.optional(v.boolean()),
  }).index("by_user", ["userId"]),
  // In-app notifications
  notifications: defineTable({
    userId: v.id("users"), // Reference to auth user
    type: v.string(), // Notification type identifier
    title: v.string(), // Short title for the notification
    body: v.optional(v.string()), // Optional details
    data: v.optional(v.any()), // Flexible payload for deep links
    status: v.union(
      v.literal("unread"),
      v.literal("read"),
      v.literal("archived"),
    ),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("normal"), v.literal("high")),
    ),
    createdAt: v.number(),
    readAt: v.optional(v.number()),
    archivedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_user_createdAt", ["userId", "createdAt"]),

  // Projects - Task containers with status, color, icon
  projects: defineTable({
    userId: v.id("users"), // Reference to auth user
    title: v.string(), // Project title
    description: v.optional(v.string()), // Optional description
    status: v.union(
      v.literal("active"),
      v.literal("archived"),
      v.literal("deleted"),
    ),
    color: v.string(), // Hex color: "#ff5733"
    icon: v.string(), // Emoji/icon identifier
    createdAt: v.number(), // Timestamp
    updatedAt: v.number(), // Timestamp
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"]),

  // Tags - Flexible tagging system with usage tracking
  tags: defineTable({
    userId: v.id("users"), // Reference to auth user
    name: v.string(), // Tag name
    color: v.string(), // Hex color: "#ff5733"
    usageCount: v.number(), // Track popularity
    createdAt: v.number(), // Timestamp
  })
    .index("by_user", ["userId"])
    .index("by_user_usage", ["userId", "usageCount"]),

  // Tasks - Rich task management with AI integration
  tasks: defineTable({
    // Core fields
    userId: v.id("users"), // Reference to auth user
    title: v.string(), // Task title
    description: v.optional(v.string()), // Optional description
    notes: v.optional(v.string()), // Private notes for the task
    status: v.union(
      v.literal("Not Started"),
      v.literal("To Do"),
      v.literal("In Progress"),
      v.literal("Completed"),
    ),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),

    // Dates
    dueDate: v.optional(v.number()), // Timestamp for precise timing
    scheduledDate: v.optional(v.string()), // YYYY-MM-DD for day-based planning
    completionDate: v.optional(v.number()), // When actually completed

    // Relationships
    projectId: v.optional(v.id("projects")), // Many-to-one with projects
    tagIds: v.array(v.id("tags")), // Many-to-many with tags
    parentTaskId: v.optional(v.id("tasks")), // Self-referencing for subtasks

    // Enhanced task management
    estimatedDuration: v.optional(v.number()), // Minutes
    actualDuration: v.optional(v.number()), // Minutes
    energyLevel: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
    ),
    context: v.array(v.string()), // @home, @office, @calls, etc.
    source: v.union(
      v.literal("inbox"),
      v.literal("created"),
      v.literal("ai-suggested"),
    ),
    orderIndex: v.number(), // For manual ordering

    // AI & Intelligence
    aiSummary: v.optional(v.string()), // AI-generated summary
    aiContext: v.any(), // Flexible AI analysis data
    embedding: v.optional(v.array(v.number())), // For future semantic search

    // Metadata
    lastActiveAt: v.number(), // Activity tracking
    streakCount: v.number(), // Completion streak
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard"),
    ),
    isTemplate: v.boolean(), // Template flag

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_user_project", ["userId", "projectId"])
    .index("by_user_scheduled", ["userId", "scheduledDate"])
    .index("by_user_due", ["userId", "dueDate"])
    .index("by_user_priority", ["userId", "priority"])
    .index("by_user_active", ["userId", "lastActiveAt"])
    .index("by_user_parent", ["userId", "parentTaskId"])
    .index("by_user_tags", ["userId", "tagIds"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["userId"],
    }),

  // Notes - Rich text notes with project association
  notes: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    contentText: v.string(),
    noteType: v.optional(v.string()),
    templateKey: v.optional(v.string()),
    reviewer: v.optional(
      v.object({
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
      }),
    ),
    pinned: v.boolean(),
    projectId: v.optional(v.id("projects")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_project", ["userId", "projectId"])
    .index("by_user_pinned", ["userId", "pinned"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["userId"],
    })
    .searchIndex("search_content", {
      searchField: "contentText",
      filterFields: ["userId"],
    }),

  // Inbox Items - Capture and triage
  inboxItems: defineTable({
    userId: v.id("users"),
    content: v.string(),
    status: v.union(v.literal("open"), v.literal("archived")),
    labels: v.optional(v.array(v.string())),
    source: v.optional(v.union(v.literal("manual"), v.literal("ai"))),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_user_createdAt", ["userId", "createdAt"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["userId", "status"],
    }),

  // Subtasks - Lightweight checklists under tasks
  subtasks: defineTable({
    userId: v.id("users"), // Reference to auth user
    taskId: v.id("tasks"), // Parent task
    title: v.string(), // Subtask title
    isComplete: v.boolean(), // Completion status
    orderIndex: v.number(), // Ordering within task
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_task", ["userId", "taskId"]),
});

export default schema;
