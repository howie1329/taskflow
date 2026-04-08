type Citation = {
  path: string
  startLine?: number | null
  endLine?: number | null
  label?: string
}

type Finding = {
  title: string
  detail: string
  citations?: Citation[]
}

type ResearchOutput = {
  summary?: string
  keyFindings?: Finding[]
  limitations?: string[]
}

const formatCitation = (citation: Citation) => {
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

export const buildDaytonaResearchModelOutput = (output: unknown) => {
  if (!output || typeof output !== "object") {
    return {
      type: "text" as const,
      value: "Daytona repo research completed without a structured summary.",
    }
  }

  const research = output as ResearchOutput
  const sections: string[] = []

  if (typeof research.summary === "string" && research.summary.trim().length > 0) {
    sections.push(`Summary: ${research.summary.trim()}`)
  }

  if (Array.isArray(research.keyFindings) && research.keyFindings.length > 0) {
    const findings = research.keyFindings
      .slice(0, 4)
      .map((finding) => {
        const evidence =
          Array.isArray(finding.citations) && finding.citations.length > 0
            ? ` Evidence: ${finding.citations.slice(0, 3).map(formatCitation).join(", ")}`
            : ""

        return `- ${finding.title}: ${finding.detail}${evidence}`
      })
      .join("\n")

    sections.push(`Key findings:\n${findings}`)
  }

  if (Array.isArray(research.limitations) && research.limitations.length > 0) {
    sections.push(`Limitations: ${research.limitations.join(" ")}`)
  }

  return {
    type: "text" as const,
    value:
      sections.join("\n\n") ||
      "Daytona repo research completed without a structured summary.",
  }
}
