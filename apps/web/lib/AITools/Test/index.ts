import { tool } from "ai"
import { z } from "zod"
import { tavily } from "@tavily/core"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

const taskStatusSchema = z.enum([
  "Not Started",
  "To Do",
  "In Progress",
  "Completed",
])

const webSourceSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  snippet: z.string(),
})

const taskLiteSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: taskStatusSchema,
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueDate: z.number().optional(),
  projectId: z.string().optional(),
})

const webSearchProgressSchema = z.object({
  status: z.enum([
    "searching_web",
    "gathering_info",
    "found_sources",
    "completed",
    "error",
  ]),
  message: z.string(),
  query: z.string(),
  sources: z.array(webSourceSchema).optional(),
  summary: z.string().optional(),
})

const userTasksProgressSchema = z.object({
  status: z.enum([
    "loading_tasks",
    "filtering_tasks",
    "completed",
    "error",
  ]),
  message: z.string(),
  total: z.number().optional(),
  tasks: z.array(taskLiteSchema).optional(),
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

export const TestTools = {
  testWebSearch: tool({
    description:
      "Searches the web in progressive steps and returns a source-backed summary",
    inputSchema: z.object({
      query: z.string().describe("What to search for"),
      maxResults: z
        .number()
        .int()
        .min(1)
        .max(8)
        .default(5)
        .describe("How many sources to return"),
    }),
    outputSchema: webSearchProgressSchema,
    toModelOutput: (output) => {
      const sourceLines = (output.sources ?? [])
        .map((source, index) => `${index + 1}. ${source.title} (${source.url})`)
        .join("\n")

      return [
        `Web research for: ${output.query}`,
        output.summary ? `Summary: ${output.summary}` : "",
        sourceLines ? `Sources:\n${sourceLines}` : "Sources: none",
      ]
        .filter(Boolean)
        .join("\n\n")
    },
    execute: async function* ({ query, maxResults }) {
      yield {
        status: "searching_web",
        message: `Searching web for \"${query}\"...`,
        query,
      }

      const client = tavily({ apiKey: process.env.TAVILY_API_KEY! })
      const response = await client.search(query, {
        maxResults,
        includeAnswer: "advanced",
      })

      yield {
        status: "gathering_info",
        message: `Gathering info for \"${query}\"...`,
        query,
      }

      const sources = (response.results ?? []).slice(0, maxResults).map((item) => ({
        title: item.title,
        url: item.url,
        snippet: item.content,
      }))

      yield {
        status: "found_sources",
        message: `Found ${sources.length} sources`,
        query,
        sources,
      }

      return {
        status: "completed",
        message: `Web search complete with ${sources.length} sources`,
        query,
        sources,
        summary: response.answer ?? undefined,
      }
    },
  }),
  testUserTasks: tool({
    description:
      "Fetches the signed-in user's tasks from the database with progressive updates",
    inputSchema: z.object({
      status: taskStatusSchema.optional(),
      projectId: z.string().optional(),
      hideCompleted: z.boolean().optional(),
      limit: z.number().int().min(1).max(25).default(10),
    }),
    outputSchema: userTasksProgressSchema,
    toModelOutput: (output) => {
      const taskLines = (output.tasks ?? [])
        .map((task, index) => `${index + 1}. [${task.status}] ${task.title}`)
        .join("\n")

      return [
        `Loaded ${output.total ?? output.tasks?.length ?? 0} user tasks`,
        taskLines ? `Tasks:\n${taskLines}` : "Tasks: none",
      ].join("\n\n")
    },
    execute: async function* (
      { status, projectId, hideCompleted, limit },
      { experimental_context },
    ) {
      yield {
        status: "loading_tasks",
        message: "Loading tasks from Taskflow database...",
      }

      const { token } = getToolContext(experimental_context)
      const convex = createClient(token)
      const tasks = await convex.query(api.tasks.listMyTasks, {
        status,
        projectId: projectId as Id<"projects"> | undefined,
        hideCompleted,
      })

      yield {
        status: "filtering_tasks",
        message: `Fetched ${tasks.length} tasks, preparing top ${limit}...`,
        total: tasks.length,
      }

      const topTasks = tasks.slice(0, limit).map((task) => ({
        id: task._id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        projectId: task.projectId,
      }))

      return {
        status: "completed",
        message: `Loaded ${topTasks.length} tasks`,
        total: tasks.length,
        tasks: topTasks,
      }
    },
  }),
} as const

export const TestToolsKeys = Object.keys(TestTools) as Array<
  keyof typeof TestTools
>
