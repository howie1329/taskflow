import { z } from "zod"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { defineConvexTool } from "./define-convex-tool"

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

const noteSchema = z
  .object({
    _id: z.string(),
    title: z.string(),
    content: z.string().optional(),
    contentText: z.string().optional(),
    pinned: z.boolean().optional(),
    projectId: z.string().optional(),
    createdAt: z.number().optional(),
    updatedAt: z.number().optional(),
  })
  .passthrough()

const listInboxItemsResponseSchema = z.object({
  items: z.array(inboxItemSchema),
  nextCursor: z.union([z.string(), z.null()]),
})

const successSchema = z.object({
  success: z.boolean(),
})

export const taskflowTools = {
  listTasks: defineConvexTool({
    toolKey: "listTasks",
    description: "List tasks for the signed-in user",
    inputSchema: z.object({
      status: taskStatusSchema.optional(),
      projectId: z.string().optional(),
      hideCompleted: z.boolean().optional(),
      scheduledDate: z.union([z.string(), z.null()]).optional(),
    }),
    outputSchema: z.array(taskSchema),
    progressMessages: {
      running: "Loading your tasks...",
      done: (_, result) => `Loaded ${result.length} tasks.`,
      error: "Failed to load your tasks.",
    },
    run: async ({ input, client }) =>
      client.query(api.tasks.listMyTasks, {
        status: input.status,
        projectId: input.projectId as Id<"projects"> | undefined,
        hideCompleted: input.hideCompleted,
        scheduledDate: input.scheduledDate as string | undefined,
      }),
  }),

  getTask: defineConvexTool({
    toolKey: "getTask",
    description: "Get a single task by ID",
    inputSchema: z.object({ taskId: z.string() }),
    outputSchema: z.union([taskSchema, z.null()]),
    progressMessages: {
      running: "Loading task...",
      done: (_, result) => (result ? "Task loaded." : "No task found."),
      error: "Failed to load task.",
    },
    run: async ({ input, client }) =>
      client.query(api.tasks.getMyTask, {
        taskId: input.taskId as Id<"tasks">,
      }),
  }),

  createTask: defineConvexTool({
    toolKey: "createTask",
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
    outputSchema: taskSchema,
    progressMessages: {
      running: (input) => `Creating task "${input.title}"...`,
      done: (input, result) => `Created task "${result?.title ?? input.title}".`,
      error: (input) => `Failed to create task "${input.title}".`,
    },
    run: async ({ input, client }) =>
      client.mutation(api.tasks.createTask, {
        ...input,
        projectId: input.projectId as Id<"projects"> | undefined,
        tagIds: input.tagIds as Id<"tags">[] | undefined,
      }),
  }),

  updateTask: defineConvexTool({
    toolKey: "updateTask",
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
    outputSchema: taskSchema,
    progressMessages: {
      running: "Updating task...",
      done: "Task updated.",
      error: "Failed to update task.",
    },
    run: async ({ input, client }) =>
      client.mutation(api.tasks.updateTask, {
        ...input,
        taskId: input.taskId as Id<"tasks">,
        projectId: input.projectId as Id<"projects"> | null | undefined,
        tagIds: input.tagIds as Id<"tags">[] | null | undefined,
      }),
  }),

  deleteTask: defineConvexTool({
    toolKey: "deleteTask",
    description: "Delete a task",
    inputSchema: z.object({ taskId: z.string() }),
    outputSchema: successSchema,
    progressMessages: {
      running: "Deleting task...",
      done: "Task deleted.",
      error: "Failed to delete task.",
    },
    run: async ({ input, client }) =>
      client.mutation(api.tasks.deleteTask, {
        taskId: input.taskId as Id<"tasks">,
      }),
  }),

  listProjects: defineConvexTool({
    toolKey: "listProjects",
    description: "List projects for the signed-in user",
    inputSchema: z.object({ status: projectStatusSchema.optional() }),
    outputSchema: z.array(projectSchema),
    progressMessages: {
      running: "Loading your projects...",
      done: (_, result) => `Loaded ${result.length} projects.`,
      error: "Failed to load your projects.",
    },
    run: async ({ input, client }) =>
      client.query(api.projects.listMyProjects, { status: input.status }),
  }),

  getProject: defineConvexTool({
    toolKey: "getProject",
    description: "Get a single project by ID",
    inputSchema: z.object({ projectId: z.string() }),
    outputSchema: z.union([projectSchema, z.null()]),
    progressMessages: {
      running: "Loading project...",
      done: (_, result) => (result ? "Project loaded." : "No project found."),
      error: "Failed to load project.",
    },
    run: async ({ input, client }) =>
      client.query(api.projects.getMyProject, {
        projectId: input.projectId as Id<"projects">,
      }),
  }),

  createProject: defineConvexTool({
    toolKey: "createProject",
    description: "Create a new project",
    inputSchema: z.object({
      title: z.string(),
      description: z.string().optional(),
      color: z.string().optional(),
      icon: z.string().optional(),
    }),
    outputSchema: projectSchema,
    progressMessages: {
      running: (input) => `Creating project "${input.title}"...`,
      done: (input, result) => `Created project "${result?.title ?? input.title}".`,
      error: (input) => `Failed to create project "${input.title}".`,
    },
    run: async ({ input, client }) =>
      client.mutation(api.projects.createProject, input),
  }),

  updateProject: defineConvexTool({
    toolKey: "updateProject",
    description: "Update an existing project",
    inputSchema: z.object({
      projectId: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      color: z.string().optional(),
      icon: z.string().optional(),
      status: projectStatusSchema.optional(),
    }),
    outputSchema: projectSchema,
    progressMessages: {
      running: "Updating project...",
      done: "Project updated.",
      error: "Failed to update project.",
    },
    run: async ({ input, client }) =>
      client.mutation(api.projects.updateProject, {
        ...input,
        projectId: input.projectId as Id<"projects">,
      }),
  }),

  deleteProject: defineConvexTool({
    toolKey: "deleteProject",
    description: "Delete a project",
    inputSchema: z.object({ projectId: z.string() }),
    outputSchema: successSchema,
    progressMessages: {
      running: "Deleting project...",
      done: "Project deleted.",
      error: "Failed to delete project.",
    },
    run: async ({ input, client }) =>
      client.mutation(api.projects.deleteProject, {
        projectId: input.projectId as Id<"projects">,
      }),
  }),

  listInboxItems: defineConvexTool({
    toolKey: "listInboxItems",
    description: "List inbox items for the signed-in user",
    inputSchema: z.object({ status: inboxStatusSchema.optional() }),
    outputSchema: listInboxItemsResponseSchema,
    progressMessages: {
      running: "Loading inbox items...",
      done: (_, result) => `Loaded ${result.items.length} inbox items.`,
      error: "Failed to load inbox items.",
    },
    run: async ({ input, client }) =>
      client.query(api.inbox.listMyInboxItems, { status: input.status }),
  }),

  getInboxItem: defineConvexTool({
    toolKey: "getInboxItem",
    description: "Get a single inbox item by ID",
    inputSchema: z.object({ inboxItemId: z.string() }),
    outputSchema: z.union([inboxItemSchema, z.null()]),
    progressMessages: {
      running: "Loading inbox item...",
      done: (_, result) => (result ? "Inbox item loaded." : "No inbox item found."),
      error: "Failed to load inbox item.",
    },
    run: async ({ input, client }) =>
      client.query(api.inbox.getMyInboxItem, {
        inboxItemId: input.inboxItemId as Id<"inboxItems">,
      }),
  }),

  createInboxItem: defineConvexTool({
    toolKey: "createInboxItem",
    description: "Create a new inbox item",
    inputSchema: z.object({ content: z.string() }),
    outputSchema: inboxItemSchema,
    progressMessages: {
      running: "Creating inbox item...",
      done: "Created inbox item.",
      error: "Failed to create inbox item.",
    },
    run: async ({ input, client }) =>
      client.mutation(api.inbox.createInboxItem, { content: input.content }),
  }),

  updateInboxItem: defineConvexTool({
    toolKey: "updateInboxItem",
    description: "Update an existing inbox item",
    inputSchema: z.object({
      inboxItemId: z.string(),
      content: z.string().optional(),
      status: inboxStatusSchema.optional(),
      labels: z.union([z.array(z.string()), z.null()]).optional(),
    }),
    outputSchema: inboxItemSchema,
    progressMessages: {
      running: "Updating inbox item...",
      done: "Inbox item updated.",
      error: "Failed to update inbox item.",
    },
    run: async ({ input, client }) =>
      client.mutation(api.inbox.updateInboxItem, {
        ...input,
        inboxItemId: input.inboxItemId as Id<"inboxItems">,
      }),
  }),

  deleteInboxItem: defineConvexTool({
    toolKey: "deleteInboxItem",
    description: "Delete an inbox item",
    inputSchema: z.object({ inboxItemId: z.string() }),
    outputSchema: successSchema,
    progressMessages: {
      running: "Deleting inbox item...",
      done: "Inbox item deleted.",
      error: "Failed to delete inbox item.",
    },
    run: async ({ input, client }) =>
      client.mutation(api.inbox.deleteInboxItem, {
        inboxItemId: input.inboxItemId as Id<"inboxItems">,
      }),
  }),

  listNotes: defineConvexTool({
    toolKey: "listNotes",
    description: "List notes for the signed-in user",
    inputSchema: z.object({}),
    outputSchema: z.array(noteSchema),
    progressMessages: {
      running: "Loading your notes...",
      done: (_, result) => `Loaded ${result.length} notes.`,
      error: "Failed to load your notes.",
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async ({ input, client }) =>
      client.query(api.notes.listMyNotes, {}),
  }),

  getNote: defineConvexTool({
    toolKey: "getNote",
    description: "Get a single note by ID",
    inputSchema: z.object({ noteId: z.string() }),
    outputSchema: z.union([noteSchema, z.null()]),
    progressMessages: {
      running: "Loading note...",
      done: (_, result) => (result ? "Note loaded." : "No note found."),
      error: "Failed to load note.",
    },
    run: async ({ input, client }) =>
      client.query(api.notes.getMyNote, {
        noteId: input.noteId as Id<"notes">,
      }),
  }),

  createNote: defineConvexTool({
    toolKey: "createNote",
    description: "Create a new note",
    inputSchema: z.object({
      title: z.string().optional(),
      content: z.string().optional(),
      contentText: z.string().optional(),
      projectId: z.string().optional(),
    }),
    outputSchema: noteSchema,
    progressMessages: {
      running: (input) => `Creating note "${input.title || "Untitled"}"...`,
      done: (input, result) => `Created note "${result?.title || input.title || "Untitled"}".`,
      error: (input) => `Failed to create note "${input.title || "Untitled"}".`,
    },
    run: async ({ input, client }) =>
      client.mutation(api.notes.createNote, {
        ...input,
        projectId: input.projectId as Id<"projects"> | undefined,
      }),
  }),

  updateNote: defineConvexTool({
    toolKey: "updateNote",
    description: "Update an existing note",
    inputSchema: z.object({
      noteId: z.string(),
      title: z.string().optional(),
      content: z.string().optional(),
      contentText: z.string().optional(),
      pinned: z.boolean().optional(),
      projectId: z.union([z.string(), z.null()]).optional(),
    }),
    outputSchema: noteSchema,
    progressMessages: {
      running: "Updating note...",
      done: (input, result) => `Updated note "${result?.title || input.title || "Untitled"}".`,
      error: "Failed to update note.",
    },
    run: async ({ input, client }) =>
      client.mutation(api.notes.updateNote, {
        ...input,
        noteId: input.noteId as Id<"notes">,
        projectId: input.projectId as Id<"projects"> | null | undefined,
      }),
  }),

  deleteNote: defineConvexTool({
    toolKey: "deleteNote",
    description: "Delete a note",
    inputSchema: z.object({ noteId: z.string() }),
    outputSchema: successSchema,
    progressMessages: {
      running: "Deleting note...",
      done: "Note deleted.",
      error: "Failed to delete note.",
    },
    run: async ({ input, client }) =>
      client.mutation(api.notes.deleteNote, {
        noteId: input.noteId as Id<"notes">,
      }),
  }),
} as const

export const taskflowToolsKeys = Object.keys(taskflowTools)
