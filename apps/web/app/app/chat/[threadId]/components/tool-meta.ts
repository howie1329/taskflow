import type { ToolUIPart } from "ai";
import {
  detectProvider,
  providerConfig,
} from "@/components/ai-elements/provider-badge";
import type { ToolCall, ToolStateInfo } from "./tool-calls";
import { getToolDefinition } from "./tool-definitions";

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
  if (!input || typeof input !== "object") return null;
  const inputObj = input as Record<string, unknown>;
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
