import { z } from "zod";

// Common schemas
const uuidSchema = z.string().uuid("Invalid UUID format");
const userIdSchema = z.string().min(1, "User ID is required");

// Priority enum schema
const prioritySchema = z.enum(["None", "Low", "Medium", "High"], {
  errorMap: () => ({ message: "Priority must be None, Low, Medium, or High" }),
});

// Status schema for tasks
const taskStatusSchema = z.enum(["notStarted", "inProgress", "completed", "onHold"], {
  errorMap: () => ({ message: "Status must be notStarted, inProgress, completed, or onHold" }),
});

// Task schemas
export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(500, "Title must be less than 500 characters"),
    description: z.string().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.null()),
    priority: prioritySchema.optional(),
    categories: z.string().optional(),
    labels: z.array(z.string()).optional(),
    status: taskStatusSchema.optional(),
    projectId: uuidSchema.optional().or(z.null()),
    notes: z.string().optional(),
    subtasks: z.array(z.string()).optional(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    taskId: uuidSchema,
  }),
  body: z.object({
    title: z.string().min(1).max(500).optional(),
    description: z.string().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.null()),
    priority: prioritySchema.optional(),
    categories: z.string().optional(),
    labels: z.array(z.string()).optional(),
    status: taskStatusSchema.optional(),
    projectId: uuidSchema.optional().or(z.null()),
    notes: z.string().optional(),
    isCompleted: z.boolean().optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  }),
});

export const taskParamsSchema = z.object({
  params: z.object({
    taskId: uuidSchema,
  }),
});

export const projectParamsSchema = z.object({
  params: z.object({
    projectId: uuidSchema,
  }),
});

// Note schemas
export const createNoteSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(500, "Title must be less than 500 characters"),
    description: z.string().optional(),
    content: z.string().optional(),
    blocks: z.any().optional(), // JSONB field - can be any structure
    taskId: uuidSchema.optional().or(z.null()),
    linkedTask: z.array(uuidSchema).optional(),
  }),
});

export const updateNoteSchema = z.object({
  params: z.object({
    noteId: uuidSchema,
  }),
  body: z.object({
    title: z.string().min(1).max(500).optional(),
    description: z.string().optional(),
    content: z.string().optional(),
    blocks: z.any().optional(),
    taskId: uuidSchema.optional().or(z.null()),
    linkedTask: z.array(uuidSchema).optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  }),
});

export const noteParamsSchema = z.object({
  params: z.object({
    noteId: uuidSchema,
  }),
});

// Project schemas
export const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(500, "Title must be less than 500 characters"),
    description: z.string().optional(),
    deadline: z.string().datetime().optional().or(z.null()),
    tags: z.any().optional(), // JSON field
    isComplete: z.boolean().optional(),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    projectId: uuidSchema,
  }),
  body: z.object({
    title: z.string().min(1).max(500).optional(),
    description: z.string().optional(),
    deadline: z.string().datetime().optional().or(z.null()),
    tags: z.any().optional(),
    isComplete: z.boolean().optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  }),
});

// Subtask schemas
export const createSubtaskSchema = z.object({
  body: z.object({
    taskId: uuidSchema,
    subtaskName: z.string().min(1, "Subtask name is required").max(500),
    status: z.string().optional(),
    isComplete: z.boolean().optional(),
  }),
});

export const updateSubtaskSchema = z.object({
  params: z.object({
    subtaskId: uuidSchema,
  }),
  body: z.object({
    subtaskName: z.string().min(1).max(500).optional(),
    isComplete: z.boolean().optional(),
    status: z.string().optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  }),
});

export const subtaskParamsSchema = z.object({
  params: z.object({
    subtaskId: uuidSchema,
  }),
});

// Notification schemas
export const createNotificationSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(200),
    content: z.string().min(1, "Content is required").max(1000),
    data: z.any().optional(), // JSONB field
  }),
});

export const notificationParamsSchema = z.object({
  params: z.object({
    notificationId: uuidSchema,
  }),
});

// Conversation schemas
export const createConversationSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(500).optional(),
    summary: z.string().optional(),
    tags: z.array(z.string()).optional(),
    intent: z.string().optional(),
  }),
});

export const conversationParamsSchema = z.object({
  params: z.object({
    conversationId: uuidSchema,
  }),
});

export const conversationIdParamsSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

// AI/Message schemas
export const sendMessageSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    messages: z.array(z.object({
      role: z.enum(["user", "assistant", "system"]),
      parts: z.array(z.object({
        text: z.string(),
      })),
      metadata: z.object({
        model: z.string().optional(),
      }).optional(),
    })).min(1, "At least one message is required"),
  }),
});

export const generateSuggestedMessagesSchema = z.object({
  body: z.object({
    conversationId: uuidSchema.optional(),
    model: z.string().optional(),
  }),
});

export const createNoteFromAISchema = z.object({
  body: z.object({
    message: z.string().min(1, "Message is required"),
    model: z.string().optional(),
  }),
});

// Query parameter schemas
export const paginationQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

// Search schemas
export const searchSchema = z.object({
  body: z.object({
    search: z.string().min(1, "Search query is required").max(500),
  }),
});
