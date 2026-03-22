import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { Output, stepCountIs, ToolLoopAgent as Agent, tool } from "ai"
import { z } from "zod"
import {
  listSandboxRepoFiles,
  readSandboxRepoFile,
  runSandboxReadCommand,
  searchSandboxRepo,
} from "@/lib/daytona/server"

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
  path: z.string(),
  content: z.string(),
  startLine: z.number(),
  endLine: z.number(),
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
  exitCode: z.number(),
  stdout: z.string(),
  truncated: z.boolean(),
  message: z.string(),
  path: z.string().nullable(),
  startLine: z.number().nullable(),
  endLine: z.number().nullable(),
})

const subagentCitationSchema = z.object({
  path: z.string(),
  startLine: z.number().int().min(1).nullable(),
  endLine: z.number().int().min(1).nullable(),
  label: z.string().nullable(),
})

const subagentFindingSchema = z.object({
  title: z.string(),
  detail: z.string(),
  citations: z.array(subagentCitationSchema),
})

const subagentResearchOutputSchema = z.object({
  summary: z.string(),
  keyFindings: z.array(subagentFindingSchema),
  citations: z.array(subagentCitationSchema),
  limitations: z.array(z.string()),
})

export const daytonaResearchCitationSchema = z.object({
  path: z.string(),
  startLine: z.number().int().min(1).nullable(),
  endLine: z.number().int().min(1).nullable(),
  label: z.string().nullable(),
})

export const daytonaResearchFindingSchema = z.object({
  title: z.string(),
  detail: z.string(),
  citations: z.array(daytonaResearchCitationSchema),
})

export const daytonaResearchOutputSchema = z.object({
  task: z.string(),
  summary: z.string(),
  keyFindings: z.array(daytonaResearchFindingSchema),
  citations: z.array(daytonaResearchCitationSchema),
  limitations: z.array(z.string()),
  transcript: z.any().nullable(),
  message: z.string(),
})

type DaytonaResearchCitation = z.infer<typeof daytonaResearchCitationSchema>
type DaytonaResearchFinding = z.infer<typeof daytonaResearchFindingSchema>
type DaytonaResearchResult = z.infer<typeof daytonaResearchOutputSchema>

type DaytonaResearchOptions = {
  task: string
  sandboxId: string
  repoUrl: string
  clonePath?: string
  abortSignal?: AbortSignal
  emitProgress?: (status: "running" | "done" | "error", text: string) => void
}

const DEFAULT_SUMMARY = "Daytona research completed, but the subagent did not return a structured summary."

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

const normalizeLine = (value: number | null | undefined) =>
  typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.floor(value) : null

const normalizeCitation = (
  citation: z.infer<typeof subagentCitationSchema>,
): DaytonaResearchCitation => ({
  path: citation.path.trim(),
  startLine: normalizeLine(citation.startLine),
  endLine: normalizeLine(citation.endLine),
  label: citation.label && citation.label.trim().length > 0 ? citation.label.trim() : null,
})

const dedupeCitations = (citations: DaytonaResearchCitation[]) => {
  const seen = new Set<string>()

  return citations.filter((citation) => {
    const key = `${citation.path}:${citation.startLine ?? ""}:${citation.endLine ?? ""}:${citation.label ?? ""}`
    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

const normalizeStructuredResearch = ({
  task,
  structuredOutput,
  transcript,
}: {
  task: string
  structuredOutput: z.infer<typeof subagentResearchOutputSchema> | undefined
  transcript: unknown
}): DaytonaResearchResult => {
  if (!structuredOutput) {
    return {
      task,
      summary: DEFAULT_SUMMARY,
      keyFindings: [],
      citations: [],
      limitations: ["The research subagent did not return a structured output object."],
      transcript,
      message: "Daytona research completed.",
    }
  }

  const findings: DaytonaResearchFinding[] = structuredOutput.keyFindings.map((finding) => ({
    title: finding.title.trim(),
    detail: finding.detail.trim(),
    citations: dedupeCitations(finding.citations.map(normalizeCitation)),
  }))

  const citations = dedupeCitations([
    ...structuredOutput.citations.map(normalizeCitation),
    ...findings.flatMap((finding) => finding.citations),
  ])

  return daytonaResearchOutputSchema.parse({
    task,
    summary:
      structuredOutput.summary.trim().length > 0
        ? structuredOutput.summary.trim()
        : DEFAULT_SUMMARY,
    keyFindings: findings,
    citations,
    limitations: structuredOutput.limitations
      .map((value) => value.trim())
      .filter((value) => value.length > 0),
    transcript,
    message: "Daytona research completed.",
  })
}

const describeToolProgress = (toolName: string, input: unknown) => {
  if (toolName === "listRepoFiles") {
    const path =
      input && typeof input === "object" && typeof (input as { path?: unknown }).path === "string"
        ? (input as { path: string }).path
        : "."
    return `Scanning repo files in ${path}...`
  }

  if (toolName === "searchRepo") {
    const query =
      input && typeof input === "object" && typeof (input as { query?: unknown }).query === "string"
        ? (input as { query: string }).query
        : "query"
    return `Searching the repo for "${query}"...`
  }

  if (toolName === "readRepoFile") {
    const path =
      input && typeof input === "object" && typeof (input as { path?: unknown }).path === "string"
        ? (input as { path: string }).path
        : "file"
    return `Reading ${path}...`
  }

  if (toolName === "runReadCommand") {
    const command =
      input && typeof input === "object" && typeof (input as { command?: unknown }).command === "string"
        ? (input as { command: string }).command
        : "command"
    return `Running bounded repo inspection: ${command}...`
  }

  return "Researching the attached repo..."
}

export async function runDaytonaResearchAgent({
  task,
  sandboxId,
  repoUrl,
  clonePath,
  abortSignal,
  emitProgress,
}: DaytonaResearchOptions): Promise<DaytonaResearchResult> {
  const openRouterKey = process.env.OPENROUTER_AI_KEY
  if (!openRouterKey) {
    throw new Error("Missing OPENROUTER_AI_KEY")
  }

  const openRouter = createOpenRouter({ apiKey: openRouterKey })

  const researchAgent = new Agent({
    model: openRouter("openai/gpt-4o-mini"),
    stopWhen: stepCountIs(13),
    output: Output.object({
      schema: subagentResearchOutputSchema,
    }),
    instructions: `You are a Daytona repo research subagent.

You investigate a single attached repository using read-only repo tools.

Rules:
- Stay strictly read-only.
- Prefer search before reading files.
- Use bounded inspection only when list/search/read are not enough.
- Focus on the user's question and avoid exhaustive repo tours unless asked.
- When evidence is incomplete, say so.
- Return grounded, citation-rich findings that match the structured output schema.`,
    tools: {
      listRepoFiles: tool({
        description:
          "List files and directories in the attached repo to understand the codebase structure or narrow the next search path.",
        inputSchema: z.object({
          path: z.string().optional(),
          limit: z.number().int().min(1).max(200).optional(),
        }),
        outputSchema: listRepoFilesOutputSchema,
        execute: async ({ path, limit }) => {
          const result = await listSandboxRepoFiles({
            sandboxId,
            repoUrl,
            clonePath,
            path,
            limit,
          })

          return {
            files: result.entries,
            truncated: result.truncated,
            message: result.truncated
              ? "Showing the first set of repo entries. Narrow the path to see more."
              : "Listed repo entries.",
          }
        },
      }),
      searchRepo: tool({
        description:
          "Search the attached repo with ripgrep to locate implementations, symbols, routes, configs, or strings before reading files.",
        inputSchema: z.object({
          query: z.string().min(1),
          path: z.string().optional(),
          limit: z.number().int().min(1).max(100).optional(),
        }),
        outputSchema: searchRepoOutputSchema,
        execute: async ({ query, path, limit }) => {
          const result = await searchSandboxRepo({
            sandboxId,
            repoUrl,
            clonePath,
            query,
            path,
            limit,
          })

          return {
            matches: result.matches,
            truncated: result.truncated,
            message: result.truncated
              ? "Showing the first set of matches. Narrow the query or path to see more."
              : "Search complete.",
          }
        },
      }),
      readRepoFile: tool({
        description:
          "Read a file or line range from the attached repo to verify implementation details and cite the relevant lines.",
        inputSchema: z.object({
          path: z.string(),
          startLine: z.number().int().min(1).optional(),
          endLine: z.number().int().min(1).optional(),
        }),
        outputSchema: readRepoFileOutputSchema,
        execute: async ({ path, startLine, endLine }) => {
          const result = await readSandboxRepoFile({
            sandboxId,
            repoUrl,
            clonePath,
            path,
            startLine,
            endLine,
          })

          return {
            path: result.path,
            content: result.content,
            startLine: result.startLine,
            endLine: result.endLine,
            truncated: result.truncated,
            message: result.truncated
              ? "Showing a truncated file snippet. Narrow the line range to inspect more."
              : "File read complete.",
          }
        },
      }),
      runReadCommand: tool({
        description:
          "Run a tightly constrained read-only repo inspection command only when list/search/read are not enough for the task.",
        inputSchema: runReadCommandInputSchema,
        outputSchema: runReadCommandOutputSchema,
        execute: async (input) => {
          const normalizedInput = normalizeRunReadCommandInput(input)

          const result = await runSandboxReadCommand(
            {
              sandboxId,
              repoUrl,
              clonePath,
            },
            normalizedInput,
          )

          return {
            command: input.command,
            exitCode: result.exitCode,
            stdout: result.stdout,
            truncated: result.truncated,
            path: result.path ?? null,
            startLine: result.startLine ?? null,
            endLine: result.endLine ?? null,
            message: result.truncated
              ? "Showing truncated command output. Narrow the command input to inspect more."
              : "Command completed.",
          }
        },
      }),
    },
    experimental_onStart: () => {
      emitProgress?.("running", "Launching Daytona research subagent...")
    },
    experimental_onToolCallStart: ({ toolCall }) => {
      emitProgress?.("running", describeToolProgress(toolCall.toolName, toolCall.input))
    },
  })

  const result = await researchAgent.generate({
    prompt: `Repository: ${repoUrl}

Task: ${task}`,
    abortSignal,
  })

  const transcript = {
    text: result.text,
    messages: result.response.messages,
    steps: result.steps,
  }

  const structuredResult = normalizeStructuredResearch({
    task,
    structuredOutput: result.output,
    transcript,
  })

  emitProgress?.(
    "done",
    structuredResult.keyFindings.length > 0
      ? `Daytona research found ${structuredResult.keyFindings.length} grounded findings.`
      : "Daytona research completed.",
  )

  return structuredResult
}
