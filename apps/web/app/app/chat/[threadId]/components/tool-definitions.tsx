import type { ReactNode } from "react";
import { AdvancedResearchCard } from "@/components/ai-elements/advanced-research-card";
import { ExaAnswerCard } from "@/components/ai-elements/exa-answer-card";
import { ExaWebSearchCard } from "@/components/ai-elements/exa-web-search-card";
import { FirecrawlScrapeCard } from "@/components/ai-elements/firecrawl-scrape-card";
import { FirecrawlSearchCard } from "@/components/ai-elements/firecrawl-search-card";
import { ParallelWebSearchCard } from "@/components/ai-elements/parallel-web-search-card";
import { TaskflowToolResultCard } from "@/components/ai-elements/taskflow-tool-result-card";
import { TavilyWebSearchCard } from "@/components/ai-elements/tavily-web-search-card";
import { ValyuFinanceSearchCard } from "@/components/ai-elements/valyu-finance-search-card";
import { ValyuWebSearchCard } from "@/components/ai-elements/valyu-web-search-card";
import {
  isTavilyWebSearchOutput,
  normalizeTavilyOutput,
} from "@/lib/AITools/Tavily/types";
import { TASKFLOW_TOOL_KEYS } from "@/lib/AITools/taskflow-tool-keys";
import type { ToolCall } from "./tool-calls";

type ToolDefinition = {
  render?: (toolCall: ToolCall) => ReactNode | null;
  summarize?: (toolCall: ToolCall) => string | null;
};

function getOutputArrayLength(output: unknown, key: string): number {
  if (!output || typeof output !== "object") return 0;
  const value = (output as Record<string, unknown>)[key];
  return Array.isArray(value) ? value.length : 0;
}

function renderTaskflowTool(toolCall: ToolCall) {
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
    );
  }

  return null;
}

function summarizeTaskflowTool(toolCall: ToolCall) {
  if (
    !TASKFLOW_TOOL_KEYS.includes(
      toolCall.toolKey as (typeof TASKFLOW_TOOL_KEYS)[number],
    )
  ) {
    return null;
  }

  if (toolCall.toolKey.startsWith("create")) return "Created successfully";
  if (toolCall.toolKey.startsWith("update")) return "Updated successfully";
  if (toolCall.toolKey.startsWith("delete")) return "Deleted successfully";
  if (toolCall.toolKey.startsWith("list")) return "Listed records";
  if (toolCall.toolKey.startsWith("get")) return "Fetched record";

  return null;
}

const TOOL_DEFINITIONS: Record<string, ToolDefinition> = {
  tavilyWebSearch: {
    render: (toolCall) => {
      if (!isTavilyWebSearchOutput(toolCall.output)) return null;
      const output = normalizeTavilyOutput(
        toolCall.output as unknown as Record<string, unknown>,
      );
      return <TavilyWebSearchCard {...output} />;
    },
    summarize: (toolCall) => {
      if (!isTavilyWebSearchOutput(toolCall.output)) return null;
      const output = normalizeTavilyOutput(
        toolCall.output as unknown as Record<string, unknown>,
      );
      return `Found ${output.results.length} sources`;
    },
  },
  exaWebSearch: {
    render: (toolCall) => (
      <ExaWebSearchCard input={toolCall.input} output={toolCall.output} />
    ),
    summarize: (toolCall) =>
      `Found ${getOutputArrayLength(toolCall.output, "results")} Exa results`,
  },
  exaAnswer: {
    render: (toolCall) => (
      <ExaAnswerCard input={toolCall.input} output={toolCall.output} />
    ),
    summarize: () => "Generated answer with citations",
  },
  firecrawlSearch: {
    render: (toolCall) => (
      <FirecrawlSearchCard input={toolCall.input} output={toolCall.output} />
    ),
    summarize: (toolCall) =>
      `Found ${getOutputArrayLength(toolCall.output, "data")} pages`,
  },
  firecrawlScrape: {
    render: (toolCall) => (
      <FirecrawlScrapeCard input={toolCall.input} output={toolCall.output} />
    ),
    summarize: () => "Scraped page content",
  },
  parallelWebSearch: {
    render: (toolCall) => (
      <ParallelWebSearchCard input={toolCall.input} output={toolCall.output} />
    ),
    summarize: (toolCall) =>
      `Found ${getOutputArrayLength(toolCall.output, "results")} aggregated results`,
  },
  advancedResearch: {
    render: (toolCall) => <AdvancedResearchCard output={toolCall.output} />,
    summarize: (toolCall) =>
      `Compiled ${getOutputArrayLength(toolCall.output, "sources")} multi-source results`,
  },
  valyuWebSearch: {
    render: (toolCall) => <ValyuWebSearchCard output={toolCall.output} />,
    summarize: (toolCall) =>
      `Found ${getOutputArrayLength(toolCall.output, "results")} Valyu results`,
  },
  valyuFinanceSearch: {
    render: (toolCall) => <ValyuFinanceSearchCard output={toolCall.output} />,
    summarize: (toolCall) =>
      `Found ${getOutputArrayLength(toolCall.output, "results")} Valyu results`,
  },
  taskflow: {
    render: renderTaskflowTool,
    summarize: summarizeTaskflowTool,
  },
};

export function getToolDefinition(toolKey: string): ToolDefinition | null {
  if (TOOL_DEFINITIONS[toolKey]) {
    return TOOL_DEFINITIONS[toolKey];
  }

  if (
    TASKFLOW_TOOL_KEYS.includes(toolKey as (typeof TASKFLOW_TOOL_KEYS)[number])
  ) {
    return TOOL_DEFINITIONS.taskflow;
  }

  return null;
}
