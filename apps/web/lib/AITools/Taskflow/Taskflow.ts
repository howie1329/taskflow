import { tool } from "ai"
import { z } from "zod"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { emitToolProgress } from "@/lib/AITools/progress"

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

const createProgressEmitter = ({
  experimental_context,
  toolKey,
  toolCallId,
}: {
  experimental_context: unknown
  toolKey: string
  toolCallId: string
}) => {
  return (status: "running" | "done" | "error", text: string) =>
    emitToolProgress({
      experimental_context,
      toolKey,
      toolCallId,
      status,
      text,
    })
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
    outputSchema: z.array(taskSchema),
    execute: async (
      { status, projectId, hideCompleted, scheduledDate },
      { toolCallId, experimental_context },
    ) => {
      const emit = createProgressEmitter({
        experimental_context,
        toolKey: "listTasks",
        toolCallId,
      })
      emit("running", "Loading your tasks...")
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      try {
        const tasks = await client.query(api.tasks.listMyTasks, {
          status,
          projectId: projectId as Id<"projects"> | undefined,
          hideCompleted,
          scheduledDate: scheduledDate as string | undefined,
        })
        emit("done", `Loaded ${tasks.length} tasks.`)
        return tasks
      } catch (error) {
        emit("error", "Failed to load your tasks.")
        throw error
      }
    },
  }),
  getTask: tool({
    description: "Get a single task by ID",
    inputSchema: z.object({
      taskId: z.string(),
    }),
    outputSchema: z.union([taskSchema, z.null()]),
    execute: async ({ taskId }, { toolCallId, experimental_context }) => {
      const emit = createProgressEmitter({
        experimental_context,
        toolKey: "getTask",
        toolCallId,
      })
      emit("running", "Loading task...")
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      try {
        const task = await client.query(api.tasks.getMyTask, {
          taskId: taskId as Id<"tasks">,
        })
        emit("done", task ? "Task loaded." : "No task found.")
        return task
      } catch (error) {
        emit("error", "Failed to load task.")
        throw error
      }
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
    outputSchema: taskSchema,
    execute: async (
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
      { toolCallId, experimental_context },
    ) => {
      const emit = createProgressEmitter({
        experimental_context,
        toolKey: "createTask",
        toolCallId,
      })
      emit("running", `Creating task "${title}"...`)
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      try {
        const task = await client.mutation(api.tasks.createTask, {
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
        emit("done", `Created task "${task?.title ?? title}".`)
        return task
      } catch (error) {
        emit("error", `Failed to create task "${title}".`)
        throw error
      }
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
    outputSchema: taskSchema,
    execute: async (
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
      { toolCallId, experimental_context },
    ) => {
      const emit = createProgressEmitter({
        experimental_context,
        toolKey: "updateTask",
        toolCallId,
      })
      emit("running", "Updating task...")
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      try {
        const task = await client.mutation(api.tasks.updateTask, {
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
        emit("done", "Task updated.")
        return task
      } catch (error) {
        emit("error", "Failed to update task.")
        throw error
      }
    },
  }),
  deleteTask: tool({
    description: "Delete a task",
    inputSchema: z.object({
      taskId: z.string(),
    }),
    outputSchema: successSchema,
    execute: async ({ taskId }, { toolCallId, experimental_context }) => {
      const emit = createProgressEmitter({
        experimental_context,
        toolKey: "deleteTask",
        toolCallId,
      })
      emit("running", "Deleting task...")
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      try {
        const result = await client.mutation(api.tasks.deleteTask, {
          taskId: taskId as Id<"tasks">,
        })
        emit("done", "Task deleted.")
        return result
      } catch (error) {
        emit("error", "Failed to delete task.")
        throw error
      }
    },
  }),
  listProjects: tool({
    description: "List projects for the signed-in user",
    inputSchema: z.object({
      status: projectStatusSchema.optional(),
    }),
    outputSchema: z.array(projectSchema),
    execute: async ({ status }, { toolCallId, experimental_context }) => {
      const emit = createProgressEmitter({
        experimental_context,
        toolKey: "listProjects",
        toolCallId,
      })
      emit("running", "Loading your projects...")
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      try {
        const projects = await client.query(api.projects.listMyProjects, { status })
        emit("done", `Loaded ${projects.length} projects.`)
        return projects
      } catch (error) {
        emit("error", "Failed to load your projects.")
        throw error
      }
    },
  }),
  getProject: tool({
    description: "Get a single project by ID",
    inputSchema: z.object({
      projectId: z.string(),
    }),
    outputSchema: z.union([projectSchema, z.null()]),
    execute: async ({ projectId }, { toolCallId, experimental_context }) => {
      const emit = createProgressEmitter({
        experimental_context,
        toolKey: "getProject",
        toolCallId,
      })
      emit("running", "Loading project...")
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      try {
        const project = await client.query(api.projects.getMyProject, {
          projectId: projectId as Id<"projects">,
        })
        emit("done", project ? "Project loaded." : "No project found.")
        return project
      } catch (error) {
        emit("error", "Failed to load project.")
        throw error
      }
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
    outputSchema: projectSchema,
    execute: async (
      { title, description, color, icon },
      { toolCallId, experimental_context },
    ) => {
      const emit = createProgressEmitter({
        experimental_context,
        toolKey: "createProject",
        toolCallId,
      })
      emit("running", `Creating project "${title}"...`)
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      try {
        const project = await client.mutation(api.projects.createProject, {
          title,
          description,
          color,
          icon,
        })
        emit("done", `Created project "${project?.title ?? title}".`)
        return project
      } catch (error) {
        emit("error", `Failed to create project "${title}".`)
        throw error
      }
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
    outputSchema: projectSchema,
    execute: async (
      { projectId, title, description, color, icon, status },
      { toolCallId, experimental_context },
    ) => {
      const emit = createProgressEmitter({
        experimental_context,
        toolKey: "updateProject",
        toolCallId,
      })
      emit("running", "Updating project...")
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      try {
        const project = await client.mutation(api.projects.updateProject, {
          projectId: projectId as Id<"projects">,
          title,
          description,
          color,
          icon,
          status,
        })
        emit("done", "Project updated.")
        return project
      } catch (error) {
        emit("error", "Failed to update project.")
        throw error
      }
    },
  }),
  deleteProject: tool({
    description: "Delete a project",
    inputSchema: z.object({
      projectId: z.string(),
    }),
    outputSchema: successSchema,
    execute: async ({ projectId }, { toolCallId, experimental_context }) => {
      const emit = createProgressEmitter({
        experimental_context,
        toolKey: "deleteProject",
        toolCallId,
      })
      emit("running", "Deleting project...")
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      try {
        const result = await client.mutation(api.projects.deleteProject, {
          projectId: projectId as Id<"projects">,
        })
        emit("done", "Project deleted.")
        return result
      } catch (error) {
        emit("error", "Failed to delete project.")
        throw error
      }
    },
  }),
  listInboxItems: tool({
    description: "List inbox items for the signed-in user",
    inputSchema: z.object({
      status: inboxStatusSchema.optional(),
    }),
    outputSchema: listInboxItemsResponseSchema,
    execute: async ({ status }, { toolCallId, experimental_context }) => {
      const emit = createProgressEmitter({
        experimental_context,
        toolKey: "listInboxItems",
        toolCallId,
      })
      emit("running", "Loading inbox items...")
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      try {
        const result = await client.query(api.inbox.listMyInboxItems, { status })
        emit("done", `Loaded ${result.items.length} inbox items.`)
        return result
      } catch (error) {
        emit("error", "Failed to load inbox items.")
        throw error
      }
    },
  }),
  getInboxItem: tool({
    description: "Get a single inbox item by ID",
    inputSchema: z.object({
      inboxItemId: z.string(),
    }),
    outputSchema: z.union([inboxItemSchema, z.null()]),
    execute: async ({ inboxItemId }, { toolCallId, experimental_context }) => {
      const emit = createProgressEmitter({
        experimental_context,
        toolKey: "getInboxItem",
        toolCallId,
      })
      emit("running", "Loading inbox item...")
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      try {
        const item = await client.query(api.inbox.getMyInboxItem, {
          inboxItemId: inboxItemId as Id<"inboxItems">,
        })
        emit("done", item ? "Inbox item loaded." : "No inbox item found.")
        return item
      } catch (error) {
        emit("error", "Failed to load inbox item.")
        throw error
      }
    },
  }),
  createInboxItem: tool({
    description: "Create a new inbox item",
    inputSchema: z.object({
      content: z.string(),
    }),
    outputSchema: inboxItemSchema,
    execute: async ({ content }, { toolCallId, experimental_context }) => {
      const emit = createProgressEmitter({
        experimental_context,
        toolKey: "createInboxItem",
        toolCallId,
      })
      emit("running", "Creating inbox item...")
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      try {
        const item = await client.mutation(api.inbox.createInboxItem, { content })
        emit("done", "Created inbox item.")
        return item
      } catch (error) {
        emit("error", "Failed to create inbox item.")
        throw error
      }
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
    outputSchema: inboxItemSchema,
    execute: async (
      { inboxItemId, content, status, labels },
      { toolCallId, experimental_context },
    ) => {
      const emit = createProgressEmitter({
        experimental_context,
        toolKey: "updateInboxItem",
        toolCallId,
      })
      emit("running", "Updating inbox item...")
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      try {
        const item = await client.mutation(api.inbox.updateInboxItem, {
          inboxItemId: inboxItemId as Id<"inboxItems">,
          content,
          status,
          labels,
        })
        emit("done", "Inbox item updated.")
        return item
      } catch (error) {
        emit("error", "Failed to update inbox item.")
        throw error
      }
    },
  }),
  deleteInboxItem: tool({
    description: "Delete an inbox item",
    inputSchema: z.object({
      inboxItemId: z.string(),
    }),
    outputSchema: successSchema,
    execute: async ({ inboxItemId }, { toolCallId, experimental_context }) => {
      const emit = createProgressEmitter({
        experimental_context,
        toolKey: "deleteInboxItem",
        toolCallId,
      })
      emit("running", "Deleting inbox item...")
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      try {
        const result = await client.mutation(api.inbox.deleteInboxItem, {
          inboxItemId: inboxItemId as Id<"inboxItems">,
        })
        emit("done", "Inbox item deleted.")
        return result
      } catch (error) {
        emit("error", "Failed to delete inbox item.")
        throw error
      }
    },
  }),
  listNotes: tool({
    description: "List notes for the signed-in user",
    inputSchema: z.object({}),
    outputSchema: z.array(noteSchema),
    execute: async (_input, { toolCallId, experimental_context }) => {
      const emit = createProgressEmitter({
        experimental_context,
        toolKey: "listNotes",
        toolCallId,
      })
      emit("running", "Loading your notes...")
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      try {
        const notes = await client.query(api.notes.listMyNotes, {})
        emit("done", `Loaded ${notes.length} notes.`)
        return notes
      } catch (error) {
        emit("error", "Failed to load your notes.")
        throw error
      }
    },
  }),
  getNote: tool({
    description: "Get a single note by ID",
    inputSchema: z.object({
      noteId: z.string(),
    }),
    outputSchema: z.union([noteSchema, z.null()]),
    execute: async ({ noteId }, { toolCallId, experimental_context }) => {
      const emit = createProgressEmitter({
        experimental_context,
        toolKey: "getNote",
        toolCallId,
      })
      emit("running", "Loading note...")
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      try {
        const note = await client.query(api.notes.getMyNote, {
          noteId: noteId as Id<"notes">,
        })
        emit("done", note ? "Note loaded." : "No note found.")
        return note
      } catch (error) {
        emit("error", "Failed to load note.")
        throw error
      }
    },
  }),
  createNote: tool({
    description: "Create a new note",
    inputSchema: z.object({
      title: z.string().optional(),
      content: z.string().optional(),
      contentText: z.string().optional(),
      projectId: z.string().optional(),
    }),
    outputSchema: noteSchema,
    execute: async (
      { title, content, contentText, projectId },
      { toolCallId, experimental_context },
    ) => {
      const emit = createProgressEmitter({
        experimental_context,
        toolKey: "createNote",
        toolCallId,
      })
      emit("running", `Creating note "${title || "Untitled"}"...`)
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      try {
        const note = await client.mutation(api.notes.createNote, {
          title,
          content,
          contentText,
          projectId: projectId as Id<"projects"> | undefined,
        })
        emit("done", `Created note "${note?.title || title || "Untitled"}".`)
        return note
      } catch (error) {
        emit("error", `Failed to create note "${title || "Untitled"}".`)
        throw error
      }
    },
  }),
  updateNote: tool({
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
    execute: async (
      { noteId, title, content, contentText, pinned, projectId },
      { toolCallId, experimental_context },
    ) => {
      const emit = createProgressEmitter({
        experimental_context,
        toolKey: "updateNote",
        toolCallId,
      })
      emit("running", "Updating note...")
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      try {
        const note = await client.mutation(api.notes.updateNote, {
          noteId: noteId as Id<"notes">,
          title,
          content,
          contentText,
          pinned,
          projectId: projectId as Id<"projects"> | null | undefined,
        })
        emit("done", `Updated note "${note?.title || title || "Untitled"}".`)
        return note
      } catch (error) {
        emit("error", "Failed to update note.")
        throw error
      }
    },
  }),
  deleteNote: tool({
    description: "Delete a note",
    inputSchema: z.object({
      noteId: z.string(),
    }),
    outputSchema: successSchema,
    execute: async ({ noteId }, { toolCallId, experimental_context }) => {
      const emit = createProgressEmitter({
        experimental_context,
        toolKey: "deleteNote",
        toolCallId,
      })
      emit("running", "Deleting note...")
      const { token } = getToolContext(experimental_context)
      const client = createClient(token)
      try {
        const result = await client.mutation(api.notes.deleteNote, {
          noteId: noteId as Id<"notes">,
        })
        emit("done", "Note deleted.")
        return result
      } catch (error) {
        emit("error", "Failed to delete note.")
        throw error
      }
    },
  }),
} as const


export const taskflowToolsKeys = Object.keys(taskflowTools)
