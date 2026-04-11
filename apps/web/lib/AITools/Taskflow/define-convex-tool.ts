import { tool } from "ai"
import { ConvexHttpClient } from "convex/browser"
import { emitToolProgress } from "@/lib/AITools/progress"
import type { z } from "zod"

type ToolContext = {
  token: string
  userId?: string | null
}

export function getToolContext(context: unknown) {
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

export function createConvexClient(token: string) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_CONVEX_URL")
  }

  const client = new ConvexHttpClient(url)
  client.setAuth(token)
  return client
}

type DefineConvexToolOptions<
  TInput extends z.ZodType,
  TOutput extends z.ZodType,
> = {
  toolKey: string
  description: string
  inputSchema: TInput
  outputSchema: TOutput
  run: (args: {
    input: z.infer<TInput>
    client: ConvexHttpClient
    token: string
    userId: string
  }) => Promise<z.infer<TOutput>>
  progressMessages: {
    running: string | ((input: z.infer<TInput>) => string)
    done: string | ((input: z.infer<TInput>, result: z.infer<TOutput>) => string)
    error: string | ((input: z.infer<TInput>) => string)
  }
}

function resolveMessage<T>(
  msg: string | ((arg: T, ...rest: unknown[]) => string),
  ...args: [T, ...unknown[]]
): string {
  return typeof msg === "function" ? msg(...args) : msg
}

export function defineConvexTool<
  TInput extends z.ZodType,
  TOutput extends z.ZodType,
>(options: DefineConvexToolOptions<TInput, TOutput>) {
  return tool({
    description: options.description,
    inputSchema: options.inputSchema,
    outputSchema: options.outputSchema,
    execute: async (input, { toolCallId, experimental_context }) => {
      const emit = (status: "running" | "done" | "error", text: string) =>
        emitToolProgress({
          experimental_context,
          toolKey: options.toolKey,
          toolCallId,
          status,
          text,
        })

      emit("running", resolveMessage(options.progressMessages.running, input))

      const { token, userId } = getToolContext(experimental_context)
      const client = createConvexClient(token)

      try {
        const result = await options.run({ input, client, token, userId })
        emit("done", resolveMessage(options.progressMessages.done, input, result))
        return result
      } catch (error) {
        emit("error", resolveMessage(options.progressMessages.error, input))
        throw error
      }
    },
  })
}
