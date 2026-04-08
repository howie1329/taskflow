import { tool } from "ai"
import { ConvexHttpClient } from "convex/browser"
import { z } from "zod"
import { api } from "@/convex/_generated/api"
import { emitToolProgress } from "@/lib/AITools/progress"
import { buildDaytonaResearchModelOutput } from "@/lib/AITools/Custom/daytona-research-model-output"
import {
  deleteSandbox,
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
import {
  daytonaResearchOutputSchema,
  runDaytonaResearchAgent,
} from "@/lib/daytona/research-agent"

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

const runReadCommandInputSchema = z.object({
  command: z.enum(["pwd", "git_status", "git_log", "ls", "find", "cat", "head", "sed", "rg"]),
  path: z.string().optional(),
  query: z.string().optional(),
  limit: z.number().int().min(1).max(200).optional(),
  depth: z.number().int().min(1).max(5).optional(),
  lines: z.number().int().min(1).max(200).optional(),
  startLine: z.number().int().min(1).optional(),
  endLine: z.number().int().min(1).optional(),
})

const runReadCommandOutputSchema = z.object({
  command: z.string(),
  exitCode: z.number().nullable(),
  stdout: z.string(),
  truncated: z.boolean(),
  message: z.string(),
  path: z.string().nullable().optional(),
  startLine: z.number().nullable().optional(),
  endLine: z.number().nullable().optional(),
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

const isAbortError = (error: unknown) =>
  error instanceof Error && error.name === "AbortError"

const normalizeRunReadCommandInput = (
  input: z.infer<typeof runReadCommandInputSchema>,
) => {
  switch (input.command) {
    case "pwd":
    case "git_status":
      return { command: input.command } as const
    case "git_log":
      return { command: input.command, limit: input.limit } as const
    case "ls":
      return { command: input.command, path: input.path } as const
    case "find":
      return {
        command: input.command,
        path: input.path,
        depth: input.depth,
        limit: input.limit,
      } as const
    case "cat":
      if (!input.path) {
        throw new Error("The read command 'cat' requires a file path.")
      }
      return { command: input.command, path: input.path } as const
    case "head":
      if (!input.path) {
        throw new Error("The read command 'head' requires a file path.")
      }
      return {
        command: input.command,
        path: input.path,
        lines: input.lines,
      } as const
    case "sed":
      if (!input.path) {
        throw new Error("The read command 'sed' requires a file path.")
      }
      return {
        command: input.command,
        path: input.path,
        startLine: input.startLine,
        endLine: input.endLine,
      } as const
    case "rg":
      if (!input.query) {
        throw new Error("The read command 'rg' requires a query string.")
      }
      return {
        command: input.command,
        query: input.query,
        path: input.path,
        limit: input.limit,
      } as const
  }
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
    "Check whether the active chat thread has a Daytona repo sandbox attached and what state it is in. Use this for repo-analysis setup, attached repo availability, or when the user asks whether the sandbox is ready.",
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
    "Start the existing Daytona sandbox for the active chat thread when repo analysis is needed and the sandbox is currently stopped.",
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
    "Stop the existing Daytona sandbox for the active chat thread when the user asks to stop the attached repo workspace or it should no longer stay running.",
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
    "List files and directories in the attached repo. Prefer this to orient yourself in the codebase, inspect folders, and choose the next file to read.",
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

    if (!ready.ok) {
      emit("done", ready.message)
      return listRepoFilesOutputSchema.parse({
        files: [],
        truncated: false,
        message: ready.message,
      })
    }

    if (!ready.daytona.sandboxId) {
      emit("done", MISSING_DAYTONA_MESSAGE)
      return listRepoFilesOutputSchema.parse({
        files: [],
        truncated: false,
        message: MISSING_DAYTONA_MESSAGE,
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

export const researchDaytonaRepoTool = tool({
  description:
    "Delegate broad repo analysis to a dedicated Daytona research subagent. Prefer this for codebase questions like 'where is X', 'how does this work', 'summarize this repo', or 'what does this function do' so the main assistant stays focused on synthesis.",
  inputSchema: z.object({
    task: z.string().min(3),
  }),
  outputSchema: daytonaResearchOutputSchema,
  execute: async ({ task }, { toolCallId, experimental_context, abortSignal }) => {
    const emit = createProgressEmitter({
      experimental_context,
      toolKey: "researchDaytonaRepo",
      toolCallId,
    })
    emit("running", "Preparing Daytona repo research...")

    const { token, threadId } = getToolContext(experimental_context)
    const client = createClient(token)
    const ready = await ensureReadySandbox({ client, threadId, emit })

    if (!ready.ok || !ready.daytona.sandboxId) {
      const message = ready.ok ? MISSING_DAYTONA_MESSAGE : ready.message
      emit("done", message)

      return daytonaResearchOutputSchema.parse({
        task,
        summary: message,
        keyFindings: [],
        citations: [],
        limitations: [message],
        transcript: null,
        message,
      })
    }

    try {
      return await runDaytonaResearchAgent({
        task,
        sandboxId: ready.daytona.sandboxId,
        repoUrl: ready.daytona.repoUrl,
        clonePath: ready.daytona.clonePath,
        abortSignal,
        emitProgress: emit,
      })
    } catch (error) {
      if (isAbortError(error)) {
        throw error
      }

      const message =
        error instanceof Error ? error.message : "Daytona research failed."

      emit("error", message)
      return daytonaResearchOutputSchema.parse({
        task,
        summary: message,
        keyFindings: [],
        citations: [],
        limitations: [message],
        transcript: null,
        message,
      })
    }
  },
  toModelOutput: ({ output }) => buildDaytonaResearchModelOutput(output),
})

export const searchDaytonaRepoTool = tool({
  description:
    "Search the attached repo with ripgrep to locate implementations, symbols, routes, config, or strings before reading files. Prefer this for 'where is X?' questions.",
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

    if (!ready.ok) {
      emit("done", ready.message)
      return searchRepoOutputSchema.parse({
        matches: [],
        truncated: false,
        message: ready.message,
      })
    }

    if (!ready.daytona.sandboxId) {
      emit("done", MISSING_DAYTONA_MESSAGE)
      return searchRepoOutputSchema.parse({
        matches: [],
        truncated: false,
        message: MISSING_DAYTONA_MESSAGE,
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
    "Read a file from the attached repo to verify implementation details. Prefer this after search results to inspect the exact code and cite the file path and line range in your answer.",
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

    if (!ready.ok) {
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

    if (!ready.daytona.sandboxId) {
      emit("done", MISSING_DAYTONA_MESSAGE)
      return readRepoFileOutputSchema.parse({
        path: null,
        content: "",
        startLine: null,
        endLine: null,
        truncated: false,
        message: MISSING_DAYTONA_MESSAGE,
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
    "Run a tightly constrained read-only command in the attached repo only when list/search/read are not enough. Use this for bounded inspection, not as a first choice.",
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

    if (!ready.ok) {
      emit("done", ready.message)
      return runReadCommandOutputSchema.parse({
        command: input.command,
        exitCode: null,
        stdout: "",
        truncated: false,
        message: ready.message,
        path: null,
        startLine: null,
        endLine: null,
      })
    }

    if (!ready.daytona.sandboxId) {
      emit("done", MISSING_DAYTONA_MESSAGE)
      return runReadCommandOutputSchema.parse({
        command: input.command,
        exitCode: null,
        stdout: "",
        truncated: false,
        message: MISSING_DAYTONA_MESSAGE,
        path: null,
        startLine: null,
        endLine: null,
      })
    }

    const normalizedInput = normalizeRunReadCommandInput(input)

    const result = await runSandboxReadCommand(
      {
        sandboxId: ready.daytona.sandboxId,
        repoUrl: ready.daytona.repoUrl,
        clonePath: ready.daytona.clonePath,
      },
      normalizedInput,
    )

    emit("done", `Command ${input.command} finished with exit code ${result.exitCode}.`)
    return runReadCommandOutputSchema.parse({
      command: input.command,
      exitCode: result.exitCode,
      stdout: result.stdout,
      truncated: result.truncated,
      path: result.path ?? null,
      startLine: result.startLine ?? null,
      endLine: result.endLine ?? null,
      message:
        result.truncated
          ? "Showing truncated command output. Narrow the command input to inspect more."
          : "Command completed.",
    })
  },
})

export const deleteDaytonaInstanceTool = tool({
  description:
    "Delete the Daytona sandbox attached to the active chat thread only when the user explicitly asks to remove or reset the attached repo workspace.",
  inputSchema: z.object({}),
  outputSchema: daytonaStatusResponseSchema,
  execute: async (_input, { toolCallId, experimental_context }) => {
    const emit = createProgressEmitter({
      experimental_context,
      toolKey: "deleteDaytonaInstance",
      toolCallId,
    })
    emit("running", "Deleting Daytona sandbox...")

    const { token, threadId } = getToolContext(experimental_context)
    const client = createClient(token)
    const thread = await loadThread(client, threadId)

    if (!thread?.daytona?.sandboxId) {
      emit("done", MISSING_DAYTONA_MESSAGE)
      return daytonaStatusResponseSchema.parse(EMPTY_DAYTONA_STATUS)
    }

    await deleteSandbox(thread.daytona.sandboxId)
    await client.mutation(api.chat.clearThreadDaytonaState, { threadId })

    emit("done", "Daytona sandbox deleted.")
    return daytonaStatusResponseSchema.parse(EMPTY_DAYTONA_STATUS)
  },
})
