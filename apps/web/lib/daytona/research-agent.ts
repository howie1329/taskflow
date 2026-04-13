import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { Output, stepCountIs, ToolLoopAgent as Agent, tool } from "ai"
import { z } from "zod"
import {
  listSandboxRepoFiles,
  readSandboxRepoFile,
  runSandboxReadCommand,
  searchSandboxRepo,
} from "@/lib/daytona/server"
import {
  listRepoFilesOutputSchema,
  searchRepoOutputSchema,
  readRepoFileOutputSchema,
  runReadCommandInputSchema,
  runReadCommandOutputSchema,
  normalizeRunReadCommandInput,
} from "@/lib/daytona/repo-tool-schemas"

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

export const daytonaResearchActivityStepSchema = z.object({
  id: z.string(),
  label: z.string(),
  detail: z.string().nullable(),
  phase: z.enum(["discover", "inspect", "synthesize"]),
  status: z.enum(["running", "complete", "error"]),
  toolName: z.string().nullable(),
  path: z.string().nullable(),
  startLine: z.number().int().min(1).nullable(),
  endLine: z.number().int().min(1).nullable(),
  query: z.string().nullable(),
  count: z.number().int().nullable(),
})

export const daytonaResearchOutputSchema = z.object({
  task: z.string(),
  summary: z.string(),
  activity: z.array(daytonaResearchActivityStepSchema),
  keyFindings: z.array(daytonaResearchFindingSchema),
  citations: z.array(daytonaResearchCitationSchema),
  limitations: z.array(z.string()),
  transcript: z.any().nullable(),
  message: z.string(),
})

type DaytonaResearchCitation = z.infer<typeof daytonaResearchCitationSchema>
type DaytonaResearchActivityStep = z.infer<typeof daytonaResearchActivityStepSchema>
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
  activity,
  transcript,
}: {
  task: string
  structuredOutput: z.infer<typeof subagentResearchOutputSchema> | undefined
  activity: DaytonaResearchActivityStep[]
  transcript: unknown
}): DaytonaResearchResult => {
  if (!structuredOutput) {
    return {
      task,
      summary: DEFAULT_SUMMARY,
      activity,
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
    activity,
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

const getRecordString = (value: Record<string, unknown>, key: string) =>
  typeof value[key] === "string" && value[key]!.toString().trim().length > 0
    ? value[key]!.toString().trim()
    : null

const getRecordNumber = (value: Record<string, unknown>, key: string) =>
  typeof value[key] === "number" && Number.isFinite(value[key])
    ? Math.floor(value[key] as number)
    : null

const buildActivityStepFromToolResult = (
  toolResult: unknown,
  index: number,
): DaytonaResearchActivityStep | null => {
  if (!toolResult || typeof toolResult !== "object") {
    return null
  }

  const input = toolResult as Record<string, unknown>
  const toolName = getRecordString(input, "toolName")
  const output =
    input.output && typeof input.output === "object"
      ? (input.output as Record<string, unknown>)
      : null
  const toolInput =
    input.input && typeof input.input === "object"
      ? (input.input as Record<string, unknown>)
      : null

  if (!toolName) {
    return null
  }

  if (toolName === "listRepoFiles") {
    const path = getRecordString(toolInput ?? {}, "path")
    const count = Array.isArray(output?.files) ? output.files.length : 0
    return {
      id: `activity-${index}`,
      label: "Listed repo files",
      detail: count > 0 ? `Found ${count} entries${path ? ` in ${path}` : ""}.` : output ? getRecordString(output, "message") : null,
      phase: "discover",
      status: "complete",
      toolName,
      path,
      startLine: null,
      endLine: null,
      query: null,
      count,
    }
  }

  if (toolName === "searchRepo") {
    const path = getRecordString(toolInput ?? {}, "path")
    const query = getRecordString(toolInput ?? {}, "query")
    const count = Array.isArray(output?.matches) ? output.matches.length : 0
    return {
      id: `activity-${index}`,
      label: "Searched the repo",
      detail: query
        ? `Searched for "${query}"${path ? ` in ${path}` : ""} and found ${count} matches.`
        : `Found ${count} matches.`,
      phase: "discover",
      status: "complete",
      toolName,
      path,
      startLine: null,
      endLine: null,
      query,
      count,
    }
  }

  if (toolName === "readRepoFile") {
    const path = getRecordString(output ?? {}, "path") ?? getRecordString(toolInput ?? {}, "path")
    const startLine = getRecordNumber(output ?? {}, "startLine")
    const endLine = getRecordNumber(output ?? {}, "endLine")
    return {
      id: `activity-${index}`,
      label: "Read a file",
      detail: path
        ? `Inspected ${path}${startLine ? `:${startLine}${endLine && endLine !== startLine ? `-${endLine}` : ""}` : ""}.`
        : "Read a repo file.",
      phase: "inspect",
      status: "complete",
      toolName,
      path,
      startLine,
      endLine,
      query: null,
      count: null,
    }
  }

  if (toolName === "runReadCommand") {
    const command = getRecordString(output ?? {}, "command") ?? getRecordString(toolInput ?? {}, "command")
    const path = getRecordString(output ?? {}, "path")
    const startLine = getRecordNumber(output ?? {}, "startLine")
    const endLine = getRecordNumber(output ?? {}, "endLine")
    return {
      id: `activity-${index}`,
      label: "Ran bounded inspection",
      detail: command
        ? `${command}${path ? ` on ${path}` : ""}${startLine ? `:${startLine}${endLine && endLine !== startLine ? `-${endLine}` : ""}` : ""}.`
        : "Ran a bounded inspection command.",
      phase: "inspect",
      status: "complete",
      toolName,
      path,
      startLine,
      endLine,
      query: getRecordString(toolInput ?? {}, "query"),
      count: null,
    }
  }

  return null
}

const buildResearchActivity = (steps: unknown[]): DaytonaResearchActivityStep[] => {
  const activity = steps.flatMap((step, stepIndex) => {
    if (!step || typeof step !== "object") {
      return []
    }

    const input = step as Record<string, unknown>
    const toolResults = Array.isArray(input.toolResults) ? input.toolResults : []
    return toolResults
      .map((toolResult, toolIndex) =>
        buildActivityStepFromToolResult(toolResult, stepIndex * 10 + toolIndex),
      )
      .filter((item): item is DaytonaResearchActivityStep => Boolean(item))
  })

  activity.push({
    id: `activity-${activity.length + 1}`,
    label: "Synthesized findings",
    detail: "Condensed the repo investigation into grounded findings and citations.",
    phase: "synthesize",
    status: "complete",
    toolName: null,
    path: null,
    startLine: null,
    endLine: null,
    query: null,
    count: null,
  })

  return activity
}

const toDebugStepSummary = (step: unknown) => {
  if (!step || typeof step !== "object") {
    return null
  }

  const input = step as Record<string, unknown>
  const text = typeof input.text === "string" ? input.text : null
  const finishReason =
    typeof input.finishReason === "string" ? input.finishReason : null

  const toolCalls = Array.isArray(input.toolCalls)
    ? input.toolCalls
      .map((toolCall) => {
        if (!toolCall || typeof toolCall !== "object") {
          return null
        }

        const record = toolCall as Record<string, unknown>
        return {
          toolName:
            typeof record.toolName === "string" ? record.toolName : "unknown",
          input: record.input ?? null,
        }
      })
      .filter(Boolean)
    : []

  const toolResults = Array.isArray(input.toolResults)
    ? input.toolResults
      .map((toolResult) => {
        if (!toolResult || typeof toolResult !== "object") {
          return null
        }

        const record = toolResult as Record<string, unknown>
        return {
          toolName:
            typeof record.toolName === "string" ? record.toolName : "unknown",
          output: record.output ?? null,
        }
      })
      .filter(Boolean)
    : []

  return {
    text,
    finishReason,
    toolCalls,
    toolResults,
  }
}

const buildConvexSafeTranscript = (result: {
  text: string
  steps: unknown[]
}) => ({
  text: result.text,
  steps: result.steps
    .map(toDebugStepSummary)
    .filter(Boolean),
})

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

  const transcript = buildConvexSafeTranscript({
    text: result.text,
    steps: result.steps,
  })
  const activity = buildResearchActivity(result.steps)

  const structuredResult = normalizeStructuredResearch({
    task,
    structuredOutput: result.output,
    activity,
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
