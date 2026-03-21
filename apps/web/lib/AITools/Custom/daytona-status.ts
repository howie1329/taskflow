import { tool } from "ai"
import { z } from "zod"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import { emitToolProgress } from "@/lib/AITools/progress"

const daytonaStatusResponseSchema = z.object({
  exists: z.boolean(),
  repoUrl: z.string().nullable(),
  sandboxId: z.string().nullable(),
  status: z.enum(["idle", "provisioning", "ready", "stopped", "failed"]),
  cloneStatus: z.enum(["not_started", "running", "succeeded", "failed"]),
  updatedAt: z.number().nullable(),
  errorMessage: z.string().nullable(),
})

type ToolContext = {
  token: string
  threadId?: string | null
}

const getToolContext = (context: unknown) => {
  if (!context || typeof context !== "object") {
    throw new Error("Missing tool context")
  }

  const { token, threadId } = context as ToolContext
  if (!token) {
    throw new Error("Missing Convex auth token")
  }
  if (!threadId) {
    throw new Error("Missing thread id in tool context")
  }

  return { token, threadId }
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

export const getDaytonaStatusTool = tool({
  description:
    "Get the current Daytona sandbox status for the active chat thread. Use this only when the user asks about Daytona instance status for this thread.",
  inputSchema: z.object({}),
  outputSchema: daytonaStatusResponseSchema,
  execute: async (_input, { toolCallId, experimental_context }) => {
    emitToolProgress({
      experimental_context,
      toolKey: "getDaytonaStatus",
      toolCallId,
      status: "running",
      text: "Checking Daytona status for this thread...",
    })

    const { token, threadId } = getToolContext(experimental_context)
    const client = createClient(token)

    try {
      const result = await client.query(api.chat.getThreadDaytonaStatus, {
        threadId,
      })

      emitToolProgress({
        experimental_context,
        toolKey: "getDaytonaStatus",
        toolCallId,
        status: "done",
        text: result.exists
          ? `Daytona status is ${result.status}.`
          : "No Daytona instance exists for this thread.",
      })

      return daytonaStatusResponseSchema.parse(result)
    } catch (error) {
      emitToolProgress({
        experimental_context,
        toolKey: "getDaytonaStatus",
        toolCallId,
        status: "error",
        text: "Failed to load Daytona status.",
      })
      throw error
    }
  },
})
