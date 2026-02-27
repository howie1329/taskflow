import { tool } from "ai"
import { z } from "zod"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { toolProgress, withToolProgressSchema } from "@/lib/AITools/tool-progress"

const taskStatusSchema = z.enum([
  "Not Started",
  "To Do",
  "In Progress",
  "Completed",
])

const taskPrioritySchema = z.enum(["low", "medium", "high"])

const taskEnergySchema = z.enum(["low", "medium", "high"])

const taskDifficultySchema = z.enum(["easy", "medium", "hard"])

const projectStatusSchema = z.enum(["active", "archived", "deleted"])

const inboxStatusSchema = z.enum(["open", "archived"])

const taskSchema = z
  .object({
    _id: z.string(),
    title: z.string(),
    status: taskStatusSchema,
    priority: taskPrioritySchema,
    description: z.string().optional(),
    notes: z.string().optional(),
    dueDate: z.number().optional(),
    scheduledDate: z.string().optional(),
    projectId: z.string().optional(),
    tagIds: z.array(z.string()),
  })
  .passthrough()

const projectSchema = z
  .object({
    _id: z.string(),
    title: z.string(),
    status: projectStatusSchema,
    description: z.string().optional(),
    color: z.string(),
    icon: z.string(),
  })
  .passthrough()

const inboxItemSchema = z
  .object({
    _id: z.string(),
    content: z.string(),
    status: inboxStatusSchema,
    labels: z.array(z.string()).optional(),
  })
  .passthrough()

const successSchema = z.object({
  success: z.boolean(),
})

type ToolContext = {
  token: string
  userId?: string | null
}

const getToolContext = (context: unknown) => {
  if (!context || typeof context !== "object") {
    throw new Error("Missing tool context")
  }

  const { token, userId } = context as ToolContext
  if (!token) {
    throw new Error("Missing Convex auth token")
  }
  if (!userId) {
    throw new Error("Missing user id in tool context")
  }

  return { token, userId }
}

const createClient = (token: string) => {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_CONVEX_URL")
  }

  const client = new ConvexHttpClient(url)
  client.setAuth(token)
  return client
}

export const taskflowTools = {
  listTasks: tool({
    description: "List tasks for the signed-in user",
    inputSchema: z.object({
      status: taskStatusSchema.optional(),
      projectId: z.string().optional(),
      hideCompleted: z.boolean().optional(),
      scheduledDate: z.union([z.string(), z.null()]).optional(),
    }),
    outputSchema: withToolProgressSchema(z.array(taskSchema)),
    execute: async function* (
      { status, projectId, hideCompleted, scheduledDate },
      { experimental_context },
    ) {
      yield toolProgress("Listing tasks")
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      return await client.query(api.tasks.listMyTasks, {
        status,
        projectId: projectId as Id<"projects"> | undefined,
        hideCompleted,
        scheduledDate,
      })
    },
  }),
  getTask: tool({
    description: "Get a single task by ID",
    inputSchema: z.object({
      taskId: z.string(),
    }),
    outputSchema: withToolProgressSchema(z.union([taskSchema, z.null()])),
    execute: async function* ({ taskId }, { experimental_context }) {
      yield toolProgress(`Fetching task "${taskId}"`)
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      return await client.query(api.tasks.getMyTask, {
        taskId: taskId as Id<"tasks">,
      })
    },
  }),
  createTask: tool({
    description: "Create a new task",
    inputSchema: z.object({
      title: z.string(),
      description: z.string().optional(),
      notes: z.string().optional(),
      status: taskStatusSchema.optional(),
      priority: taskPrioritySchema.optional(),
      dueDate: z.number().optional(),
      scheduledDate: z.string().optional(),
      projectId: z.string().optional(),
      tagIds: z.array(z.string()).optional(),
      estimatedDuration: z.number().optional(),
      energyLevel: taskEnergySchema.optional(),
      difficulty: taskDifficultySchema.optional(),
    }),
    outputSchema: withToolProgressSchema(taskSchema),
    execute: async function* (
      {
        title,
        description,
        notes,
        status,
        priority,
        dueDate,
        scheduledDate,
        projectId,
        tagIds,
        estimatedDuration,
        energyLevel,
        difficulty,
      },
      { experimental_context },
    ) {
      yield toolProgress(`Creating the task "${title}"`)
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      return await client.mutation(api.tasks.createTask, {
        title,
        description,
        notes,
        status,
        priority,
        dueDate,
        scheduledDate,
        projectId: projectId as Id<"projects"> | undefined,
        tagIds: tagIds as Id<"tags">[] | undefined,
        estimatedDuration,
        energyLevel,
        difficulty,
      })
    },
  }),
  updateTask: tool({
    description: "Update an existing task",
    inputSchema: z.object({
      taskId: z.string(),
      title: z.string().optional(),
      description: z.union([z.string(), z.null()]).optional(),
      notes: z.union([z.string(), z.null()]).optional(),
      status: taskStatusSchema.optional(),
      priority: taskPrioritySchema.optional(),
      dueDate: z.union([z.number(), z.null()]).optional(),
      scheduledDate: z.union([z.string(), z.null()]).optional(),
      projectId: z.union([z.string(), z.null()]).optional(),
      tagIds: z.union([z.array(z.string()), z.null()]).optional(),
      estimatedDuration: z.union([z.number(), z.null()]).optional(),
      energyLevel: taskEnergySchema.optional(),
      difficulty: taskDifficultySchema.optional(),
    }),
    outputSchema: withToolProgressSchema(taskSchema),
    execute: async function* (
      {
        taskId,
        title,
        description,
        notes,
        status,
        priority,
        dueDate,
        scheduledDate,
        projectId,
        tagIds,
        estimatedDuration,
        energyLevel,
        difficulty,
      },
      { experimental_context },
    ) {
      yield toolProgress(
        title ? `Updating the task "${title}"` : `Updating task "${taskId}"`,
      )
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      return await client.mutation(api.tasks.updateTask, {
        taskId: taskId as Id<"tasks">,
        title,
        description,
        notes,
        status,
        priority,
        dueDate,
        scheduledDate,
        projectId: projectId as Id<"projects"> | null | undefined,
        tagIds: tagIds as Id<"tags">[] | null | undefined,
        estimatedDuration,
        energyLevel,
        difficulty,
      })
    },
  }),
  deleteTask: tool({
    description: "Delete a task",
    inputSchema: z.object({
      taskId: z.string(),
    }),
    outputSchema: withToolProgressSchema(successSchema),
    execute: async function* ({ taskId }, { experimental_context }) {
      yield toolProgress(`Deleting task "${taskId}"`)
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      return await client.mutation(api.tasks.deleteTask, {
        taskId: taskId as Id<"tasks">,
      })
    },
  }),
  listProjects: tool({
    description: "List projects for the signed-in user",
    inputSchema: z.object({
      status: projectStatusSchema.optional(),
    }),
    outputSchema: withToolProgressSchema(z.array(projectSchema)),
    execute: async function* ({ status }, { experimental_context }) {
      yield toolProgress("Listing projects")
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      return await client.query(api.projects.listMyProjects, { status })
    },
  }),
  getProject: tool({
    description: "Get a single project by ID",
    inputSchema: z.object({
      projectId: z.string(),
    }),
    outputSchema: withToolProgressSchema(z.union([projectSchema, z.null()])),
    execute: async function* ({ projectId }, { experimental_context }) {
      yield toolProgress(`Fetching project "${projectId}"`)
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      return await client.query(api.projects.getMyProject, {
        projectId: projectId as Id<"projects">,
      })
    },
  }),
  createProject: tool({
    description: "Create a new project",
    inputSchema: z.object({
      title: z.string(),
      description: z.string().optional(),
      color: z.string().optional(),
      icon: z.string().optional(),
    }),
    outputSchema: withToolProgressSchema(projectSchema),
    execute: async function* (
      { title, description, color, icon },
      { experimental_context },
    ) {
      yield toolProgress(`Creating the project "${title}"`)
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      return await client.mutation(api.projects.createProject, {
        title,
        description,
        color,
        icon,
      })
    },
  }),
  updateProject: tool({
    description: "Update an existing project",
    inputSchema: z.object({
      projectId: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      color: z.string().optional(),
      icon: z.string().optional(),
      status: projectStatusSchema.optional(),
    }),
    outputSchema: withToolProgressSchema(projectSchema),
    execute: async function* (
      { projectId, title, description, color, icon, status },
      { experimental_context },
    ) {
      yield toolProgress(
        title
          ? `Updating the project "${title}"`
          : `Updating project "${projectId}"`,
      )
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      return await client.mutation(api.projects.updateProject, {
        projectId: projectId as Id<"projects">,
        title,
        description,
        color,
        icon,
        status,
      })
    },
  }),
  deleteProject: tool({
    description: "Delete a project",
    inputSchema: z.object({
      projectId: z.string(),
    }),
    outputSchema: withToolProgressSchema(successSchema),
    execute: async function* ({ projectId }, { experimental_context }) {
      yield toolProgress(`Deleting project "${projectId}"`)
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      return await client.mutation(api.projects.deleteProject, {
        projectId: projectId as Id<"projects">,
      })
    },
  }),
  listInboxItems: tool({
    description: "List inbox items for the signed-in user",
    inputSchema: z.object({
      status: inboxStatusSchema.optional(),
    }),
    outputSchema: withToolProgressSchema(z.array(inboxItemSchema)),
    execute: async function* ({ status }, { experimental_context }) {
      yield toolProgress("Listing inbox items")
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      return await client.query(api.inbox.listMyInboxItems, { status })
    },
  }),
  getInboxItem: tool({
    description: "Get a single inbox item by ID",
    inputSchema: z.object({
      inboxItemId: z.string(),
    }),
    outputSchema: withToolProgressSchema(z.union([inboxItemSchema, z.null()])),
    execute: async function* ({ inboxItemId }, { experimental_context }) {
      yield toolProgress(`Fetching inbox item "${inboxItemId}"`)
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      return await client.query(api.inbox.getMyInboxItem, {
        inboxItemId: inboxItemId as Id<"inboxItems">,
      })
    },
  }),
  createInboxItem: tool({
    description: "Create a new inbox item",
    inputSchema: z.object({
      content: z.string(),
    }),
    outputSchema: withToolProgressSchema(inboxItemSchema),
    execute: async function* ({ content }, { experimental_context }) {
      yield toolProgress("Creating an inbox item")
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      return await client.mutation(api.inbox.createInboxItem, { content })
    },
  }),
  updateInboxItem: tool({
    description: "Update an existing inbox item",
    inputSchema: z.object({
      inboxItemId: z.string(),
      content: z.string().optional(),
      status: inboxStatusSchema.optional(),
      labels: z.union([z.array(z.string()), z.null()]).optional(),
    }),
    outputSchema: withToolProgressSchema(inboxItemSchema),
    execute: async function* (
      { inboxItemId, content, status, labels },
      { experimental_context },
    ) {
      yield toolProgress(`Updating inbox item "${inboxItemId}"`)
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      return await client.mutation(api.inbox.updateInboxItem, {
        inboxItemId: inboxItemId as Id<"inboxItems">,
        content,
        status,
        labels,
      })
    },
  }),
  deleteInboxItem: tool({
    description: "Delete an inbox item",
    inputSchema: z.object({
      inboxItemId: z.string(),
    }),
    outputSchema: withToolProgressSchema(successSchema),
    execute: async function* ({ inboxItemId }, { experimental_context }) {
      yield toolProgress(`Deleting inbox item "${inboxItemId}"`)
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      return await client.mutation(api.inbox.deleteInboxItem, {
        inboxItemId: inboxItemId as Id<"inboxItems">,
      })
    },
  }),
} as const


export const taskflowToolsKeys = Object.keys(taskflowTools)
