import type { ToolUIPart } from "ai"
import {
  detectProvider,
  providerConfig,
} from "@/components/ai-elements/provider-badge"
import {
  isTavilyWebSearchOutput,
  normalizeTavilyOutput,
} from "@/lib/AITools/Tavily/types"
import { TASKFLOW_TOOL_KEYS } from "@/lib/AITools/taskflow-tool-keys"
import type { ToolCall, ToolStateInfo } from "./tool-types"

export type WebSearchResult = {
  title: string
  url: string
  content: string
  score: number
  raw_content: string | null
  favicon?: string
}

export type WebSearchOutput = {
  query: string
  answer: string
  images: string[]
  results: WebSearchResult[]
  response_time: string
  auto_parameters: {
    topic: string
    search_depth: string
  }
}

export function isWebSearchOutput(output: unknown): output is WebSearchOutput {
  if (!output || typeof output !== "object") return false
  const obj = output as Record<string, unknown>
  return (
    "query" in obj &&
    "answer" in obj &&
    "results" in obj &&
    Array.isArray(obj.results)
  )
}

export function getToolDisplayNameFromKey(toolKey: string): string {
  if (toolKey === "webSearch") return "Web search"
  return toolKey
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (value) => value.toUpperCase())
}

export function getToolStateInfo(state: ToolUIPart["state"]): ToolStateInfo {
  const stateMap: Record<ToolUIPart["state"], ToolStateInfo> = {
    "input-streaming": {
      badgeLabel: "Pending",
      stepStatus: "pending",
      isError: false,
    },
    "input-available": {
      badgeLabel: "Running",
      stepStatus: "active",
      isError: false,
    },
    "approval-requested": {
      badgeLabel: "Awaiting approval",
      stepStatus: "active",
      isError: false,
    },
    "approval-responded": {
      badgeLabel: "Approved",
      stepStatus: "complete",
      isError: false,
    },
    "output-available": {
      badgeLabel: "Completed",
      stepStatus: "complete",
      isError: false,
    },
    "output-error": {
      badgeLabel: "Error",
      stepStatus: "complete",
      isError: true,
    },
    "output-denied": {
      badgeLabel: "Denied",
      stepStatus: "complete",
      isError: true,
    },
  }

  return (
    stateMap[state] ?? {
      badgeLabel: state,
      stepStatus: "pending",
      isError: false,
    }
  )
}

export function getToolInputSummary(input: unknown): string | null {
  if (!input || typeof input !== "object") return null
  const inputObj = input as Record<string, unknown>
  if ("query" in inputObj && typeof inputObj.query === "string") {
    return `Searching the web for "${inputObj.query}"`
  }
  if ("title" in inputObj && typeof inputObj.title === "string") {
    return `Creating "${inputObj.title}"`
  }
  if ("name" in inputObj && typeof inputObj.name === "string") {
    return `Processing "${inputObj.name}"`
  }
  return null
}

export function summarizeToolOutput(output: unknown): string | null {
  if (output === null || output === undefined) return null

  if (typeof output === "string") {
    const trimmed = output.trim()
    if (trimmed.length === 0) return null
    return trimmed.length > 150 ? `${trimmed.slice(0, 150)}...` : trimmed
  }

  if (typeof output === "object" && !Array.isArray(output)) {
    const obj = output as Record<string, unknown>
    const entries = Object.entries(obj).filter((entry) => {
      const value = entry[1]
      if (value === null || value === undefined) return false
      if (typeof value === "object" && !Array.isArray(value)) return false
      if (typeof value === "string" && value.length > 100) return false
      return true
    })

    if (entries.length === 0) return null

    if (entries.length === 1) {
      const [key, value] = entries[0]
      return `${key}: ${value}`
    }

    return entries
      .slice(0, 3)
      .map(([key, value]) => {
        const label = key
          .replace(/_/g, " ")
          .replace(/([A-Z])/g, " $1")
          .trim()
        return `${label}: ${value}`
      })
      .join(" · ")
  }

  return null
}

function describeValue(value: unknown): string {
  if (value === null) return "null"
  if (value === undefined) return "—"
  if (Array.isArray(value)) return `${value.length} items`
  if (typeof value === "object") {
    return `${Object.keys(value as object).length} fields`
  }
  return String(value)
}

function getOutputArrayLength(output: unknown, key: string): number {
  if (!output || typeof output !== "object") return 0
  const value = (output as Record<string, unknown>)[key]
  return Array.isArray(value) ? value.length : 0
}

export function getToolSummary(toolCall: ToolCall): string | null {
  if (
    toolCall.toolKey === "tavilyWebSearch" &&
    isTavilyWebSearchOutput(toolCall.output)
  ) {
    const output = normalizeTavilyOutput(
      toolCall.output as unknown as Record<string, unknown>,
    )
    return `Found ${output.results.length} sources`
  }

  if (toolCall.toolKey === "exaWebSearch") {
    const resultCount = getOutputArrayLength(toolCall.output, "results")
    return `Found ${resultCount} Exa results`
  }

  if (toolCall.toolKey === "exaAnswer") {
    return "Generated answer with citations"
  }

  if (toolCall.toolKey === "firecrawlSearch") {
    const resultCount = getOutputArrayLength(toolCall.output, "data")
    return `Found ${resultCount} pages`
  }

  if (toolCall.toolKey === "firecrawlScrape") {
    return "Scraped page content"
  }

  if (toolCall.toolKey === "parallelWebSearch") {
    const resultCount = getOutputArrayLength(toolCall.output, "results")
    return `Found ${resultCount} aggregated results`
  }

  if (toolCall.toolKey === "advancedResearch") {
    const resultCount = getOutputArrayLength(toolCall.output, "sources")
    return `Compiled ${resultCount} multi-source results`
  }

  if (
    toolCall.toolKey === "valyuWebSearch" ||
    toolCall.toolKey === "valyuFinanceSearch"
  ) {
    const resultCount = getOutputArrayLength(toolCall.output, "results")
    return `Found ${resultCount} Valyu results`
  }

  if (
    TASKFLOW_TOOL_KEYS.includes(
      toolCall.toolKey as (typeof TASKFLOW_TOOL_KEYS)[number],
    )
  ) {
    if (toolCall.toolKey.startsWith("create")) return "Created successfully"
    if (toolCall.toolKey.startsWith("update")) return "Updated successfully"
    if (toolCall.toolKey.startsWith("delete")) return "Deleted successfully"
    if (toolCall.toolKey.startsWith("list")) return "Listed records"
    if (toolCall.toolKey.startsWith("get")) return "Fetched record"
  }

  if (toolCall.toolKey === "webSearch" && isWebSearchOutput(toolCall.output)) {
    return `Found ${toolCall.output.results.length} sources`
  }

  const outputSummary = summarizeToolOutput(toolCall.output)
  if (outputSummary) return outputSummary

  const inputSummary = getToolInputSummary(toolCall.input)
  if (inputSummary) return inputSummary

  return null
}

export function getToolMetaItems(toolCall: ToolCall) {
  const providerType = detectProvider(toolCall.toolKey)
  const providerName = providerConfig[providerType]?.name ?? "Unknown"

  const items = [
    { label: "Provider", value: providerName },
    { label: "Tool", value: toolCall.toolKey },
    { label: "Status", value: toolCall.state.replace(/-/g, " ") },
  ]

  if (toolCall.input && typeof toolCall.input === "object") {
    items.push({
      label: "Input",
      value: describeValue(toolCall.input),
    })
  }

  if (toolCall.output !== undefined) {
    items.push({
      label: "Output",
      value: describeValue(toolCall.output),
    })
  }

  if (toolCall.errorText) {
    items.push({ label: "Error", value: "Yes" })
  }

  return items
}
