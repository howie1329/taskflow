import type { ReactNode } from "react";
import { AdvancedResearchCard } from "@/components/ai-elements/advanced-research-card";
import { DaytonaResearchCard } from "./daytona-research-card";
import { ExaAnswerCard } from "@/components/ai-elements/exa-answer-card";
import { ExaWebSearchCard } from "@/components/ai-elements/exa-web-search-card";
import { FirecrawlScrapeCard } from "@/components/ai-elements/firecrawl-scrape-card";
import { FirecrawlSearchCard } from "@/components/ai-elements/firecrawl-search-card";
import { ParallelWebSearchCard } from "@/components/ai-elements/parallel-web-search-card";
import { TaskflowToolResultCard } from "@/components/ai-elements/taskflow-tool-result-card";
import { TavilyWebSearchCard } from "@/components/ai-elements/tavily-web-search-card";
import { ValyuFinanceSearchCard, ValyuWebSearchCard } from "@/components/ai-elements/valyu-search-card";
import {
  isTavilyWebSearchOutput,
  normalizeTavilyOutput,
} from "@/lib/AITools/Tavily/types";
import { TASKFLOW_TOOL_KEYS } from "@/lib/AITools/taskflow-tool-keys";
import type { ToolCall } from "./tool-calls";

type ToolDefinition = {
  render?: (
    toolCall: ToolCall,
    context: { progress: Array<{ data: { toolKey: string; toolCallId: string; status: "running" | "done" | "error"; text: string } }> },
  ) => ReactNode | null;
  summarize?: (toolCall: ToolCall) => string | null;
  hideRawPayload?: boolean;
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
  getDaytonaStatus: {
    summarize: (toolCall) => {
      if (!toolCall.output || typeof toolCall.output !== "object") {
        return "Checked Daytona status"
      }

      const output = toolCall.output as {
        exists?: boolean
        status?: string
        repoUrl?: string | null
      }

      if (!output.exists) {
        return "No Daytona instance for this thread"
      }

      return `Daytona is ${output.status ?? "unknown"}${output.repoUrl ? ` for ${output.repoUrl}` : ""}`
    },
  },
  startDaytonaInstance: {
    summarize: () => "Started Daytona sandbox",
  },
  stopDaytonaInstance: {
    summarize: () => "Stopped Daytona sandbox",
  },
  deleteDaytonaInstance: {
    summarize: () => "Deleted Daytona sandbox",
  },
  researchDaytonaRepo: {
    render: (toolCall, context) => (
      <DaytonaResearchCard
        output={toolCall.output}
        progress={context.progress.map((item) => item.data)}
      />
    ),
    summarize: (toolCall) => {
      if (!toolCall.output || typeof toolCall.output !== "object") {
        return "Researched the attached repo"
      }

      const output = toolCall.output as {
        keyFindings?: unknown[]
        citations?: unknown[]
        summary?: string
      }

      const findings = Array.isArray(output.keyFindings) ? output.keyFindings.length : 0
      const citations = Array.isArray(output.citations) ? output.citations.length : 0

      if (findings > 0) {
        return `Researched repo with ${findings} findings and ${citations} citations`
      }

      return output.summary ?? "Researched the attached repo"
    },
    hideRawPayload: true,
  },
  listDaytonaRepoFiles: {
    summarize: (toolCall) => {
      if (!toolCall.output || typeof toolCall.output !== "object") {
        return "Listed Daytona repo files"
      }

      const output = toolCall.output as {
        files?: unknown[]
        message?: string
      }

      if (!Array.isArray(output.files)) {
        return output.message ?? "Listed Daytona repo files"
      }

      return `Listed ${output.files.length} Daytona repo entries`
    },
  },
  searchDaytonaRepo: {
    summarize: (toolCall) => {
      if (!toolCall.output || typeof toolCall.output !== "object") {
        return "Searched Daytona repo"
      }

      const output = toolCall.output as {
        matches?: unknown[]
        message?: string
      }

      if (!Array.isArray(output.matches)) {
        return output.message ?? "Searched Daytona repo"
      }

      return `Found ${output.matches.length} Daytona repo matches`
    },
  },
  readDaytonaRepoFile: {
    summarize: (toolCall) => {
      if (!toolCall.output || typeof toolCall.output !== "object") {
        return "Read Daytona repo file"
      }

      const output = toolCall.output as {
        path?: string | null
        message?: string
      }

      return output.path
        ? `Read ${output.path}`
        : output.message ?? "Read Daytona repo file"
    },
  },
  runDaytonaReadCommand: {
    summarize: (toolCall) => {
      if (!toolCall.output || typeof toolCall.output !== "object") {
        return "Ran Daytona read command"
      }

      const output = toolCall.output as {
        command?: string
        exitCode?: number | null
        message?: string
        path?: string | null
        startLine?: number | null
        endLine?: number | null
      }

      if (!output.command) {
        return output.message ?? "Ran Daytona read command"
      }

      if (output.path) {
        const range =
          output.startLine && output.endLine
            ? `:${output.startLine}-${output.endLine}`
            : ""
        return `Ran ${output.command} on ${output.path}${range} (exit ${output.exitCode ?? "?"})`
      }

      return `Ran ${output.command} (exit ${output.exitCode ?? "?"})`
    },
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
