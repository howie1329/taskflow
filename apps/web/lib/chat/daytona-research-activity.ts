type ResearchCitation = {
  path?: string | null
  startLine?: number | null
  endLine?: number | null
  label?: string | null
}

type ResearchFinding = {
  title?: string
  detail?: string
  citations?: ResearchCitation[]
}

type ResearchActivityStep = {
  id?: string
  label?: string
  detail?: string | null
  phase?: string
  status?: "running" | "complete" | "error"
  toolName?: string | null
  path?: string | null
  startLine?: number | null
  endLine?: number | null
  query?: string | null
  count?: number | null
}

type ResearchOutput = {
  summary?: string
  activity?: ResearchActivityStep[]
  keyFindings?: ResearchFinding[]
  citations?: ResearchCitation[]
  limitations?: string[]
  transcript?: {
    text?: string
    steps?: unknown[]
  } | null
  message?: string
}

type ToolProgressItem = {
  toolKey: string
  toolCallId: string
  status: "running" | "done" | "error"
  text: string
}

export type DaytonaResearchActivityViewModel = {
  summary: string | null
  activity: Array<{
    id: string
    label: string
    detail: string | null
    status: "running" | "complete" | "error"
    meta: string[]
  }>
  findings: Array<{
    title: string
    detail: string
    citations: string[]
  }>
  limitations: string[]
  transcriptText: string | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function normalizeCitationLabel(citation: ResearchCitation) {
  if (!citation.path) return null

  const hasStart = typeof citation.startLine === "number"
  const hasEnd = typeof citation.endLine === "number"
  const range =
    hasStart && hasEnd
      ? citation.startLine === citation.endLine
        ? `:${citation.startLine}`
        : `:${citation.startLine}-${citation.endLine}`
      : hasStart
        ? `:${citation.startLine}`
        : ""

  return `${citation.path}${range}${citation.label ? ` (${citation.label})` : ""}`
}

function normalizeActivityStep(step: ResearchActivityStep, fallbackIndex: number) {
  const meta = [
    step.phase ? step.phase : null,
    step.query ? `query "${step.query}"` : null,
    step.path
      ? normalizeCitationLabel({
          path: step.path,
          startLine: step.startLine ?? null,
          endLine: step.endLine ?? null,
        })
      : null,
    typeof step.count === "number" ? `${step.count} result${step.count === 1 ? "" : "s"}` : null,
  ].filter((value): value is string => Boolean(value))

  return {
    id: step.id ?? `activity-${fallbackIndex}`,
    label: step.label ?? "Research step",
    detail: typeof step.detail === "string" && step.detail.trim().length > 0 ? step.detail.trim() : null,
    status: step.status ?? "complete",
    meta,
  }
}

function normalizeProgressItem(progress: ToolProgressItem, index: number) {
  const status: "running" | "complete" | "error" =
    progress.status === "done"
      ? "complete"
      : progress.status === "error"
        ? "error"
        : "running"

  return {
    id: `progress-${index}`,
    label: progress.status === "error" ? "Research error" : "Research progress",
    detail: progress.text,
    status,
    meta: [] as string[],
  }
}

export function isDaytonaResearchOutput(output: unknown): output is ResearchOutput {
  return isRecord(output) && (
    "activity" in output ||
    "keyFindings" in output ||
    "citations" in output ||
    "transcript" in output
  )
}

export function buildDaytonaResearchActivityViewModel({
  output,
  progress,
}: {
  output: unknown
  progress: ToolProgressItem[]
}): DaytonaResearchActivityViewModel | null {
  if (!isDaytonaResearchOutput(output) && progress.length === 0) {
    return null
  }

  const research = isDaytonaResearchOutput(output) ? output : {}
  const findings = Array.isArray(research.keyFindings)
    ? research.keyFindings
        .filter((finding): finding is ResearchFinding => isRecord(finding))
        .map((finding) => ({
          title: typeof finding.title === "string" ? finding.title : "Finding",
          detail: typeof finding.detail === "string" ? finding.detail : "",
          citations: Array.isArray(finding.citations)
            ? finding.citations
                .map((citation) => normalizeCitationLabel(citation))
                .filter((value): value is string => Boolean(value))
            : [],
        }))
    : []

  const activityFromOutput = Array.isArray(research.activity)
    ? research.activity.map((step, index) => normalizeActivityStep(step, index))
    : []
  const progressActivity = progress.map(normalizeProgressItem)
  const activity =
    activityFromOutput.length > 0
      ? activityFromOutput
      : progressActivity

  return {
    summary:
      typeof research.summary === "string" && research.summary.trim().length > 0
        ? research.summary.trim()
        : typeof research.message === "string"
          ? research.message
          : null,
    activity,
    findings,
    limitations: Array.isArray(research.limitations)
      ? research.limitations.filter(
          (item): item is string => typeof item === "string" && item.trim().length > 0,
        )
      : [],
    transcriptText:
      isRecord(research.transcript) && typeof research.transcript.text === "string"
        ? research.transcript.text
        : null,
  }
}
