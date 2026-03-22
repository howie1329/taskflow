import { tool } from "ai"
import { ConvexHttpClient } from "convex/browser"
import { z } from "zod"
import { api } from "@/convex/_generated/api"
import { emitToolProgress } from "@/lib/AITools/progress"
import {
  getSandboxStatus,
  listSandboxRepoFiles,
  readSandboxRepoFile,
  runSandboxReadCommand,
  searchSandboxRepo,
  startSandbox,
  stopSandbox,
} from "@/lib/daytona/server"
import {
  EMPTY_DAYTONA_STATUS,
  buildDaytonaState,
  toDaytonaStatusPayload,
  type DaytonaStatus,
  type DaytonaThreadState,
} from "@/lib/daytona/state"

const daytonaStatusResponseSchema = z.object({
  exists: z.boolean(),
  repoUrl: z.string().nullable(),
  sandboxId: z.string().nullable(),
  status: z.enum(["idle", "provisioning", "ready", "stopped", "failed"]),
  cloneStatus: z.enum(["not_started", "running", "succeeded", "failed"]),
  updatedAt: z.number().nullable(),
  errorMessage: z.string().nullable(),
})

const repoFileSchema = z.object({
  path: z.string(),
  type: z.enum(["file", "directory", "other"]),
})

const repoSearchMatchSchema = z.object({
  path: z.string(),
  line: z.number(),
  preview: z.string(),
})

const listRepoFilesOutputSchema = z.object({
  files: z.array(repoFileSchema),
  truncated: z.boolean(),
  message: z.string(),
})

const searchRepoOutputSchema = z.object({
  matches: z.array(repoSearchMatchSchema),
  truncated: z.boolean(),
  message: z.string(),
})

const readRepoFileOutputSchema = z.object({
  path: z.string().nullable(),
  content: z.string(),
  startLine: z.number().nullable(),
  endLine: z.number().nullable(),
  truncated: z.boolean(),
  message: z.string(),
})

const runReadCommandInputSchema = z.discriminatedUnion("command", [
  z.object({ command: z.literal("pwd") }),
  z.object({ command: z.literal("git_status") }),
  z.object({
    command: z.literal("git_log"),
    limit: z.number().int().min(1).max(50).optional(),
  }),
  z.object({
    command: z.literal("ls"),
    path: z.string().optional(),
  }),
  z.object({
    command: z.literal("find"),
    path: z.string().optional(),
    depth: z.number().int().min(1).max(5).optional(),
    limit: z.number().int().min(1).max(200).optional(),
  }),
  z.object({
    command: z.literal("cat"),
    path: z.string(),
  }),
  z.object({
    command: z.literal("head"),
    path: z.string(),
    lines: z.number().int().min(1).max(200).optional(),
  }),
  z.object({
    command: z.literal("sed"),
    path: z.string(),
    startLine: z.number().int().min(1).optional(),
    endLine: z.number().int().min(1).optional(),
  }),
  z.object({
    command: z.literal("rg"),
    query: z.string().min(1),
    path: z.string().optional(),
    limit: z.number().int().min(1).max(100).optional(),
  }),
])

const runReadCommandOutputSchema = z.object({
  command: z.string(),
  exitCode: z.number().nullable(),
  stdout: z.string(),
  truncated: z.boolean(),
  message: z.string(),
})

type ToolContext = {
  token: string
  threadId?: string | null
}

type DaytonaThread = {
  threadId: string
  daytona?: DaytonaThreadState | null
}

const MISSING_DAYTONA_MESSAGE =
  "No Daytona sandbox is attached to this thread. Use the Daytona sidebar first."

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

const mapSandboxState = (state: string | null | undefined): DaytonaStatus => {
  if (state === "started") {
    return "ready"
  }

  if (state === "stopped") {
    return "stopped"
  }

  if (!state) {
    return "failed"
  }

  return "provisioning"
}

const loadThread = async (client: ConvexHttpClient, threadId: string) =>
  (await client.query(api.chat.getThread, { threadId })) as DaytonaThread | null

const saveThreadDaytonaState = async ({
  client,
  threadId,
  daytona,
  status,
  errorMessage,
}: {
  client: ConvexHttpClient
  threadId: string
  daytona: DaytonaThreadState
  status: DaytonaStatus
  errorMessage?: string
}) =>
  client.mutation(api.chat.setThreadDaytonaState, {
    threadId,
    daytona: buildDaytonaState({
      repoUrl: daytona.repoUrl,
      clonePath: daytona.clonePath,
      sandboxId: daytona.sandboxId,
      createdAt: daytona.createdAt,
      cloneStatus: daytona.cloneStatus,
      status,
      errorMessage,
    }),
  })

const refreshDaytonaStatus = async ({
  client,
  threadId,
  daytona,
}: {
  client: ConvexHttpClient
  threadId: string
  daytona: DaytonaThreadState
}) => {
  if (!daytona.sandboxId) {
    return daytona
  }

  try {
    const liveState = await getSandboxStatus(daytona.sandboxId)
    const nextStatus = mapSandboxState(liveState)

    if (nextStatus === daytona.status) {
      return daytona
    }

    await saveThreadDaytonaState({
      client,
      threadId,
      daytona,
      status: nextStatus,
      errorMessage:
        nextStatus === "failed" ? "Unable to confirm Daytona status." : undefined,
    })

    return {
      ...daytona,
      status: nextStatus,
      updatedAt: Date.now(),
      errorMessage:
        nextStatus === "failed" ? "Unable to confirm Daytona status." : undefined,
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to refresh Daytona status."

    await saveThreadDaytonaState({
      client,
      threadId,
      daytona,
      status: "failed",
      errorMessage: message,
    })

    return {
      ...daytona,
      status: "failed" as const,
      updatedAt: Date.now(),
      errorMessage: message,
    }
  }
}

const ensureReadySandbox = async ({
  client,
  threadId,
  emit,
}: {
  client: ConvexHttpClient
  threadId: string
  emit: ReturnType<typeof createProgressEmitter>
}) => {
  const thread = await loadThread(client, threadId)
  if (!thread?.daytona?.sandboxId) {
    return {
      ok: false as const,
      message: MISSING_DAYTONA_MESSAGE,
    }
  }

  let daytona = await refreshDaytonaStatus({
    client,
    threadId,
    daytona: thread.daytona,
  })

  if (daytona.status === "stopped") {
    emit("running", "Starting Daytona sandbox...")
    await startSandbox(daytona.sandboxId!)
    await saveThreadDaytonaState({
      client,
      threadId,
      daytona,
      status: "ready",
    })

    daytona = {
      ...daytona,
      status: "ready",
      updatedAt: Date.now(),
      errorMessage: undefined,
    }
  }

  if (daytona.status !== "ready") {
    return {
      ok: false as const,
      message:
        daytona.status === "provisioning"
          ? "Daytona is still provisioning. Try again in a moment."
          : daytona.errorMessage ?? "Daytona sandbox is not ready right now.",
    }
  }

  return {
    ok: true as const,
    daytona,
  }
}

export const getDaytonaStatusTool = tool({
  description:
    "Get the current Daytona sandbox status for the active chat thread. Use this only when the user asks about Daytona instance status for this thread.",
  inputSchema: z.object({}),
  outputSchema: daytonaStatusResponseSchema,
  execute: async (_input, { toolCallId, experimental_context }) => {
    const emit = createProgressEmitter({
      experimental_context,
      toolKey: "getDaytonaStatus",
      toolCallId,
    })
    emit("running", "Checking Daytona status for this thread...")

    const { token, threadId } = getToolContext(experimental_context)
    const client = createClient(token)
    const thread = await loadThread(client, threadId)

    if (!thread?.daytona) {
      emit("done", "No Daytona instance exists for this thread.")
      return daytonaStatusResponseSchema.parse(EMPTY_DAYTONA_STATUS)
    }

    const daytona = await refreshDaytonaStatus({
      client,
      threadId,
      daytona: thread.daytona,
    })
    const output = toDaytonaStatusPayload(daytona)

    emit("done", `Daytona status is ${output.status}.`)
    return daytonaStatusResponseSchema.parse(output)
  },
})

export const startDaytonaInstanceTool = tool({
  description:
    "Start the existing Daytona sandbox for the active chat thread when it is stopped.",
  inputSchema: z.object({}),
  outputSchema: daytonaStatusResponseSchema,
  execute: async (_input, { toolCallId, experimental_context }) => {
    const emit = createProgressEmitter({
      experimental_context,
      toolKey: "startDaytonaInstance",
      toolCallId,
    })
    emit("running", "Starting Daytona sandbox...")

    const { token, threadId } = getToolContext(experimental_context)
    const client = createClient(token)
    const thread = await loadThread(client, threadId)

    if (!thread?.daytona?.sandboxId) {
      emit("done", MISSING_DAYTONA_MESSAGE)
      return daytonaStatusResponseSchema.parse(EMPTY_DAYTONA_STATUS)
    }

    if (thread.daytona.status !== "stopped") {
      const current = await refreshDaytonaStatus({
        client,
        threadId,
        daytona: thread.daytona,
      })
      emit("done", `Daytona is already ${current.status}.`)
      return daytonaStatusResponseSchema.parse(toDaytonaStatusPayload(current))
    }

    await startSandbox(thread.daytona.sandboxId)
    const savedThread = await saveThreadDaytonaState({
      client,
      threadId,
      daytona: thread.daytona,
      status: "ready",
    })

    emit("done", "Daytona sandbox started.")
    return daytonaStatusResponseSchema.parse(
      toDaytonaStatusPayload((savedThread as DaytonaThread | null)?.daytona ?? thread.daytona),
    )
  },
})

export const stopDaytonaInstanceTool = tool({
  description:
    "Stop the existing Daytona sandbox for the active chat thread when it is running.",
  inputSchema: z.object({}),
  outputSchema: daytonaStatusResponseSchema,
  execute: async (_input, { toolCallId, experimental_context }) => {
    const emit = createProgressEmitter({
      experimental_context,
      toolKey: "stopDaytonaInstance",
      toolCallId,
    })
    emit("running", "Stopping Daytona sandbox...")

    const { token, threadId } = getToolContext(experimental_context)
    const client = createClient(token)
    const thread = await loadThread(client, threadId)

    if (!thread?.daytona?.sandboxId) {
      emit("done", MISSING_DAYTONA_MESSAGE)
      return daytonaStatusResponseSchema.parse(EMPTY_DAYTONA_STATUS)
    }

    const current = await refreshDaytonaStatus({
      client,
      threadId,
      daytona: thread.daytona,
    })

    if (current.status === "stopped") {
      emit("done", "Daytona sandbox is already stopped.")
      return daytonaStatusResponseSchema.parse(toDaytonaStatusPayload(current))
    }

    await stopSandbox(thread.daytona.sandboxId)
    const savedThread = await saveThreadDaytonaState({
      client,
      threadId,
      daytona: current,
      status: "stopped",
    })

    emit("done", "Daytona sandbox stopped.")
    return daytonaStatusResponseSchema.parse(
      toDaytonaStatusPayload((savedThread as DaytonaThread | null)?.daytona ?? thread.daytona),
    )
  },
})

export const listDaytonaRepoFilesTool = tool({
  description:
    "List files and directories from the repo cloned into the current thread's Daytona sandbox.",
  inputSchema: z.object({
    path: z.string().optional(),
    limit: z.number().int().min(1).max(200).optional(),
  }),
  outputSchema: listRepoFilesOutputSchema,
  execute: async ({ path, limit }, { toolCallId, experimental_context }) => {
    const emit = createProgressEmitter({
      experimental_context,
      toolKey: "listDaytonaRepoFiles",
      toolCallId,
    })
    emit("running", "Listing files in the Daytona repo...")

    const { token, threadId } = getToolContext(experimental_context)
    const client = createClient(token)
    const ready = await ensureReadySandbox({ client, threadId, emit })

    if (!ready.ok || !ready.daytona.sandboxId) {
      emit("done", ready.message)
      return listRepoFilesOutputSchema.parse({
        files: [],
        truncated: false,
        message: ready.message,
      })
    }

    const result = await listSandboxRepoFiles({
      sandboxId: ready.daytona.sandboxId,
      repoUrl: ready.daytona.repoUrl,
      clonePath: ready.daytona.clonePath,
      path,
      limit,
    })

    emit("done", `Listed ${result.entries.length} repo entries.`)
    return listRepoFilesOutputSchema.parse({
      files: result.entries,
      truncated: result.truncated,
      message: result.truncated
        ? "Showing the first set of repo entries. Narrow the path to see more."
        : "Listed repo entries.",
    })
  },
})

export const searchDaytonaRepoTool = tool({
  description:
    "Search the repo cloned into the current thread's Daytona sandbox using ripgrep.",
  inputSchema: z.object({
    query: z.string().min(1),
    path: z.string().optional(),
    limit: z.number().int().min(1).max(100).optional(),
  }),
  outputSchema: searchRepoOutputSchema,
  execute: async ({ query, path, limit }, { toolCallId, experimental_context }) => {
    const emit = createProgressEmitter({
      experimental_context,
      toolKey: "searchDaytonaRepo",
      toolCallId,
    })
    emit("running", "Searching the Daytona repo...")

    const { token, threadId } = getToolContext(experimental_context)
    const client = createClient(token)
    const ready = await ensureReadySandbox({ client, threadId, emit })

    if (!ready.ok || !ready.daytona.sandboxId) {
      emit("done", ready.message)
      return searchRepoOutputSchema.parse({
        matches: [],
        truncated: false,
        message: ready.message,
      })
    }

    const result = await searchSandboxRepo({
      sandboxId: ready.daytona.sandboxId,
      repoUrl: ready.daytona.repoUrl,
      clonePath: ready.daytona.clonePath,
      query,
      path,
      limit,
    })

    emit("done", `Found ${result.matches.length} repo matches.`)
    return searchRepoOutputSchema.parse({
      matches: result.matches,
      truncated: result.truncated,
      message: result.truncated
        ? "Showing the first set of matches. Narrow the query or path to see more."
        : "Search complete.",
    })
  },
})

export const readDaytonaRepoFileTool = tool({
  description:
    "Read a file from the repo cloned into the current thread's Daytona sandbox.",
  inputSchema: z.object({
    path: z.string(),
    startLine: z.number().int().min(1).optional(),
    endLine: z.number().int().min(1).optional(),
  }),
  outputSchema: readRepoFileOutputSchema,
  execute: async (
    { path, startLine, endLine },
    { toolCallId, experimental_context },
  ) => {
    const emit = createProgressEmitter({
      experimental_context,
      toolKey: "readDaytonaRepoFile",
      toolCallId,
    })
    emit("running", "Reading a file from the Daytona repo...")

    const { token, threadId } = getToolContext(experimental_context)
    const client = createClient(token)
    const ready = await ensureReadySandbox({ client, threadId, emit })

    if (!ready.ok || !ready.daytona.sandboxId) {
      emit("done", ready.message)
      return readRepoFileOutputSchema.parse({
        path: null,
        content: "",
        startLine: null,
        endLine: null,
        truncated: false,
        message: ready.message,
      })
    }

    const result = await readSandboxRepoFile({
      sandboxId: ready.daytona.sandboxId,
      repoUrl: ready.daytona.repoUrl,
      clonePath: ready.daytona.clonePath,
      path,
      startLine,
      endLine,
    })

    emit("done", `Read ${result.path}.`)
    return readRepoFileOutputSchema.parse({
      path: result.path,
      content: result.content,
      startLine: result.startLine,
      endLine: result.endLine,
      truncated: result.truncated,
      message: result.truncated
        ? "Showing a truncated file snippet. Narrow the line range to inspect more."
        : "File read complete.",
    })
  },
})

export const runDaytonaReadCommandTool = tool({
  description:
    "Run a tightly constrained read-only command inside the current thread's Daytona repo sandbox.",
  inputSchema: runReadCommandInputSchema,
  outputSchema: runReadCommandOutputSchema,
  execute: async (input, { toolCallId, experimental_context }) => {
    const emit = createProgressEmitter({
      experimental_context,
      toolKey: "runDaytonaReadCommand",
      toolCallId,
    })
    emit("running", `Running read-only Daytona command: ${input.command}`)

    const { token, threadId } = getToolContext(experimental_context)
    const client = createClient(token)
    const ready = await ensureReadySandbox({ client, threadId, emit })

    if (!ready.ok || !ready.daytona.sandboxId) {
      emit("done", ready.message)
      return runReadCommandOutputSchema.parse({
        command: input.command,
        exitCode: null,
        stdout: "",
        truncated: false,
        message: ready.message,
      })
    }

    const result = await runSandboxReadCommand(
      {
        sandboxId: ready.daytona.sandboxId,
        repoUrl: ready.daytona.repoUrl,
        clonePath: ready.daytona.clonePath,
      },
      input,
    )

    emit("done", `Command ${input.command} finished with exit code ${result.exitCode}.`)
    return runReadCommandOutputSchema.parse({
      command: input.command,
      exitCode: result.exitCode,
      stdout: result.stdout,
      truncated: result.truncated,
      message:
        result.truncated
          ? "Showing truncated command output. Narrow the command input to inspect more."
          : "Command completed.",
    })
  },
})
