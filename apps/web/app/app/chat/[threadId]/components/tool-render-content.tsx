import type { ReactNode } from "react"
import { ExaAnswerCard } from "@/components/ai-elements/exa-answer-card"
import { ExaWebSearchCard } from "@/components/ai-elements/exa-web-search-card"
import { FirecrawlScrapeCard } from "@/components/ai-elements/firecrawl-scrape-card"
import { FirecrawlSearchCard } from "@/components/ai-elements/firecrawl-search-card"
import { ParallelWebSearchCard } from "@/components/ai-elements/parallel-web-search-card"
import { TaskflowToolResultCard } from "@/components/ai-elements/taskflow-tool-result-card"
import { TavilyWebSearchCard } from "@/components/ai-elements/tavily-web-search-card"
import { ValyuFinanceSearchCard } from "@/components/ai-elements/valyu-finance-search-card"
import { ValyuWebSearchCard } from "@/components/ai-elements/valyu-web-search-card"
import {
  isTavilyWebSearchOutput,
  normalizeTavilyOutput,
} from "@/lib/AITools/Tavily/types"
import { TASKFLOW_TOOL_KEYS } from "@/lib/AITools/taskflow-tool-keys"
import { isToolProgress } from "@/lib/AITools/tool-progress"
import type { ToolCall } from "./tool-types"
import {
  getToolStateInfo,
  summarizeToolOutput,
} from "./tool-meta"

export function renderToolContent(toolCall: ToolCall): ReactNode {
  if (toolCall.preliminary && isToolProgress(toolCall.output)) {
    return <p className="text-sm text-muted-foreground">{toolCall.output.message}</p>
  }

  if (
    toolCall.state !== "output-available" &&
    toolCall.state !== "output-error"
  ) {
    return (
      <p className="text-sm text-muted-foreground">
        {getToolStateInfo(toolCall.state, toolCall.preliminary).badgeLabel}
      </p>
    )
  }

  if (toolCall.errorText) {
    return <p className="text-sm text-destructive">{toolCall.errorText}</p>
  }

  switch (toolCall.toolKey) {
    case "tavilyWebSearch":
      if (isTavilyWebSearchOutput(toolCall.output)) {
        const output = normalizeTavilyOutput(
          toolCall.output as unknown as Record<string, unknown>,
        )
        return <TavilyWebSearchCard {...output} />
      }
      break
    case "exaWebSearch":
      return <ExaWebSearchCard output={toolCall.output} />
    case "exaAnswer":
      return <ExaAnswerCard output={toolCall.output} />
    case "firecrawlSearch":
      return <FirecrawlSearchCard output={toolCall.output} />
    case "firecrawlScrape":
      return <FirecrawlScrapeCard output={toolCall.output} />
    case "parallelWebSearch":
      return <ParallelWebSearchCard output={toolCall.output} />
    case "advancedResearch":
      return (
        <p className="text-sm text-muted-foreground">
          Advanced research completed. Open raw payload for full sources and
          scrape details.
        </p>
      )
    case "valyuWebSearch":
      return <ValyuWebSearchCard output={toolCall.output} />
    case "valyuFinanceSearch":
      return <ValyuFinanceSearchCard output={toolCall.output} />
    default:
      if (
        TASKFLOW_TOOL_KEYS.includes(
          toolCall.toolKey as (typeof TASKFLOW_TOOL_KEYS)[number],
        )
      ) {
        return (
          <TaskflowToolResultCard
            toolKey={toolCall.toolKey}
            input={toolCall.input}
            output={toolCall.output}
          />
        )
      }
  }

  const summary = summarizeToolOutput(toolCall.output)
  if (summary) {
    return <p className="text-sm">{summary}</p>
  }

  return <p className="text-sm text-muted-foreground">Completed</p>
}
