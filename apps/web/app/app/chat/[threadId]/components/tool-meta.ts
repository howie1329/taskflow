import type { ToolUIPart } from "ai";
import {
  detectProvider,
  providerConfig,
} from "@/components/ai-elements/provider-badge";
import type { ToolCall, ToolStateInfo } from "./tool-calls";
import { getToolDefinition } from "./tool-definitions";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getStringField(
  input: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = input[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function getTaskflowEntityLabel(toolKey: string) {
  if (toolKey.endsWith("Task")) return "task";
  if (toolKey.endsWith("Project")) return "project";
  if (toolKey.endsWith("Note")) return "note";
  if (toolKey.endsWith("InboxItem")) return "inbox item";
  return "record";
}

function formatIdentifier(value: string) {
  return value.length > 14 ? value.slice(0, 14) : value;
}

export function formatToolKeyLabel(toolKey: string): string {
  return toolKey
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (value) => value.toUpperCase());
}

export const getToolDisplayNameFromKey = formatToolKeyLabel;

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
  };

  return (
    stateMap[state] ?? {
      badgeLabel: state,
      stepStatus: "pending",
      isError: false,
    }
  );
}

export function getToolInputSummary(input: unknown): string | null {
  if (!isRecord(input)) return null;
  const inputObj = input;
  if ("query" in inputObj && typeof inputObj.query === "string") {
    return `Searching the web for "${inputObj.query}"`;
  }
  if ("title" in inputObj && typeof inputObj.title === "string") {
    return `Creating "${inputObj.title}"`;
  }
  if ("name" in inputObj && typeof inputObj.name === "string") {
    return `Processing "${inputObj.name}"`;
  }
  return null;
}

export function getToolInputQuery(
  input: unknown,
  toolKey?: string,
): string | null {
  if (!isRecord(input)) return null;

  const directQuery = getStringField(input, [
    "query",
    "task",
    "title",
    "name",
    "url",
    "objective",
    "content",
    "description",
  ]);

  if (directQuery) return directQuery;

  if (toolKey === "exaAnswer") {
    return getStringField(input, ["question", "searchQuery"]);
  }

  if (toolKey === "firecrawlScrape") {
    return getStringField(input, ["url"]);
  }

  if (toolKey === "advancedResearch") {
    return getStringField(input, ["query"]);
  }

  if (
    toolKey?.startsWith("get") ||
    toolKey?.startsWith("delete")
  ) {
    return getStringField(input, [
      "taskId",
      "projectId",
      "noteId",
      "inboxItemId",
    ]);
  }

  if (toolKey?.startsWith("list")) {
    return getStringField(input, ["status", "scheduledDate", "projectId"]);
  }

  return null;
}

export function summarizeToolOutput(output: unknown): string | null {
  if (output === null || output === undefined) return null;

  if (typeof output === "string") {
    const trimmed = output.trim();
    if (trimmed.length === 0) return null;
    return trimmed.length > 150 ? `${trimmed.slice(0, 150)}...` : trimmed;
  }

  if (typeof output === "object" && !Array.isArray(output)) {
    const obj = output as Record<string, unknown>;
    const entries = Object.entries(obj).filter((entry) => {
      const value = entry[1];
      if (value === null || value === undefined) return false;
      if (typeof value === "object" && !Array.isArray(value)) return false;
      if (typeof value === "string" && value.length > 100) return false;
      return true;
    });

    if (entries.length === 0) return null;

    if (entries.length === 1) {
      const [key, value] = entries[0];
      return `${key}: ${value}`;
    }

    return entries
      .slice(0, 3)
      .map(([key, value]) => {
        const label = key
          .replace(/_/g, " ")
          .replace(/([A-Z])/g, " $1")
          .trim();
        return `${label}: ${value}`;
      })
      .join(" · ");
  }

  return null;
}

function describeValue(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "—";
  if (Array.isArray(value)) return `${value.length} items`;
  if (typeof value === "object") {
    return `${Object.keys(value as object).length} fields`;
  }
  return String(value);
}

export function getToolSummary(toolCall: ToolCall): string | null {
  const definitionSummary = getToolDefinition(toolCall.toolKey)?.summarize?.(
    toolCall,
  );
  if (definitionSummary) return definitionSummary;

  const outputSummary = summarizeToolOutput(toolCall.output);
  if (outputSummary) return outputSummary;

  const inputSummary = getToolInputSummary(toolCall.input);
  if (inputSummary) return inputSummary;

  return null;
}

export function getToolStepMeta(toolCall: ToolCall): string[] {
  if (Array.isArray(toolCall.output) && toolCall.toolKey.startsWith("list")) {
    return toolCall.output.length > 0 ? [`${toolCall.output.length} items`] : [];
  }

  const output = isRecord(toolCall.output) ? toolCall.output : null;

  if (!output) return [];

  if (toolCall.toolKey === "tavilyWebSearch") {
    const results = Array.isArray(output.results) ? output.results.length : 0;
    const responseTime =
      typeof output.responseTime === "number"
        ? `${output.responseTime.toFixed(2)}s`
        : null;
    return [
      results > 0 ? `${results} sources` : null,
      responseTime,
    ].filter((value): value is string => !!value);
  }

  if (toolCall.toolKey === "exaWebSearch") {
    const results = Array.isArray(output.results) ? output.results.length : 0;
    return results > 0 ? [`${results} results`] : [];
  }

  if (toolCall.toolKey === "firecrawlSearch") {
    const pages = Array.isArray(output.data) ? output.data.length : 0;
    const credits =
      typeof output.creditsUsed === "number" ? `${output.creditsUsed} credits` : null;
    return [
      pages > 0 ? `${pages} pages` : null,
      credits,
    ].filter((value): value is string => !!value);
  }

  if (toolCall.toolKey === "parallelWebSearch") {
    const results = Array.isArray(output.results) ? output.results.length : 0;
    return results > 0 ? [`${results} results`] : [];
  }

  if (
    toolCall.toolKey === "valyuWebSearch" ||
    toolCall.toolKey === "valyuFinanceSearch"
  ) {
    const results = Array.isArray(output.results) ? output.results.length : 0;
    const cost =
      typeof output.total_deduction_dollars === "number"
        ? `$${output.total_deduction_dollars.toFixed(4)}`
        : null;
    return [
      results > 0 ? `${results} results` : null,
      cost,
    ].filter((value): value is string => !!value);
  }

  if (toolCall.toolKey === "advancedResearch") {
    const sources = Array.isArray(output.sources) ? output.sources.length : 0;
    const scraped = Array.isArray(output.scrapedSources)
      ? output.scrapedSources.length
      : 0;
    return [
      sources > 0 ? `${sources} sources` : null,
      scraped > 0 ? `${scraped} scraped` : null,
    ].filter((value): value is string => !!value);
  }

  if (toolCall.toolKey === "exaAnswer") {
    const citations = Array.isArray(output.citations) ? output.citations.length : 0;
    const requestId =
      typeof output.requestId === "string" && output.requestId.length > 0
        ? `id:${formatIdentifier(output.requestId)}`
        : null;

    return [
      citations > 0 ? `${citations} citations` : null,
      requestId,
    ].filter((value): value is string => !!value);
  }

  if (toolCall.toolKey === "firecrawlScrape") {
    const urlLoaded =
      isRecord(output.data) && typeof output.data.url === "string"
        ? "url loaded"
        : null;
    const credits =
      typeof output.creditsUsed === "number" ? `${output.creditsUsed} credits` : null;

    return [urlLoaded, credits].filter((value): value is string => !!value);
  }

  if (
    toolCall.toolKey.startsWith("get") ||
    toolCall.toolKey.startsWith("create") ||
    toolCall.toolKey.startsWith("update") ||
    toolCall.toolKey.startsWith("delete")
  ) {
    const entityLabel = getTaskflowEntityLabel(toolCall.toolKey);
    const identifier = getStringField(output, ["title", "content", "_id"]);

    return [
      identifier && output._id && identifier !== output._id
        ? `${entityLabel}: ${identifier}`
        : null,
      typeof output._id === "string" ? `id:${formatIdentifier(output._id)}` : null,
    ].filter((value): value is string => !!value);
  }

  return [];
}

export function getToolMetaItems(toolCall: ToolCall) {
  const providerType = detectProvider(toolCall.toolKey);
  const providerName = providerConfig[providerType]?.name ?? "Unknown";

  const items = [
    { label: "Provider", value: providerName },
    { label: "Tool", value: toolCall.toolKey },
    { label: "Status", value: toolCall.state.replace(/-/g, " ") },
  ];

  if (toolCall.input && typeof toolCall.input === "object") {
    items.push({
      label: "Input",
      value: describeValue(toolCall.input),
    });
  }

  if (toolCall.output !== undefined) {
    items.push({
      label: "Output",
      value: describeValue(toolCall.output),
    });
  }

  if (toolCall.errorText) {
    items.push({ label: "Error", value: "Yes" });
  }

  return items;
}
