import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const schema = defineSchema({
  ...authTables,
  baseModels: defineTable({
    modelId: v.string(),
  }).index("by_modelId", ["modelId"]),
  availableModels: defineTable({
    modelId: v.string(),
    name: v.string(),
    description: v.string(),
    pricing: v.object({
      prompt: v.string(),
      completion: v.string(),
    }),
    syncedAt: v.number(),
  }).index("by_modelId", ["modelId"]),
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
    // Future: theme, notifications, privacy settings
  }).index("by_user", ["userId"]),

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
    .index("by_user_createdAt", ["userId", "createdAt"]),

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
