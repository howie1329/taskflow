"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TASKFLOW_TOOL_KEYS } from "@/lib/AITools/taskflow-tool-keys";
import { ToolEmptyState, ToolResultHeader, ToolResultSection, ToolResultShell } from "./tool-result-shell";

type TaskflowToolKey = (typeof TASKFLOW_TOOL_KEYS)[number];

type TaskflowToolResultCardProps = {
  toolKey: string;
  input?: unknown;
  output?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function renderObjectRows(record: Record<string, unknown>) {
  const entries = Object.entries(record).slice(0, 8);
  return (
    <div className="space-y-1.5">
      {entries.map(([key, value]) => (
        <div key={key} className="flex items-center justify-between gap-3 text-xs">
          <span className="text-muted-foreground">{key}</span>
          <span className="truncate font-medium text-foreground">
            {Array.isArray(value)
              ? `${value.length} items`
              : typeof value === "object" && value !== null
                ? `${Object.keys(value).length} fields`
                : String(value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function getActionLabel(toolKey: TaskflowToolKey) {
  if (toolKey.startsWith("create")) return "Created";
  if (toolKey.startsWith("update")) return "Updated";
  if (toolKey.startsWith("delete")) return "Deleted";
  if (toolKey.startsWith("list")) return "Listed";
  if (toolKey.startsWith("get")) return "Fetched";
  return "Completed";
}

export function TaskflowToolResultCard({
  toolKey,
  input,
  output,
}: TaskflowToolResultCardProps) {
  const [showAll, setShowAll] = useState(false);

  if (!TASKFLOW_TOOL_KEYS.includes(toolKey as TaskflowToolKey)) {
    return <ToolEmptyState message="This tool key is not a Taskflow tool." />;
  }

  if (output === null) {
    return <ToolEmptyState message="No matching item was found." />;
  }

  const actionLabel = getActionLabel(toolKey as TaskflowToolKey);
  const visibleItems = Array.isArray(output)
    ? showAll
      ? output
      : output.slice(0, 5)
    : [];

  return (
    <ToolResultShell>
      <ToolResultHeader title={`Taskflow ${actionLabel}`} pills={[toolKey]} />
      {isRecord(input) ? (
        <ToolResultSection title="Input">{renderObjectRows(input)}</ToolResultSection>
      ) : null}
      {Array.isArray(output) ? (
        <ToolResultSection title="Results">
          {output.length === 0 ? (
            <ToolEmptyState message="No records returned." />
          ) : (
            <div className="divide-y divide-border/60 rounded-sm border border-border/50">
              {visibleItems.map((item, index) => (
                <div key={index} className="px-2.5 py-2 text-xs">
                  {isRecord(item) ? renderObjectRows(item) : String(item)}
                </div>
              ))}
            </div>
          )}
          {output.length > 5 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 h-7 px-2 text-xs"
              onClick={() => setShowAll((current) => !current)}
            >
              {showAll ? "Show less" : `Show all (${output.length})`}
            </Button>
          ) : null}
        </ToolResultSection>
      ) : isRecord(output) ? (
        <ToolResultSection title="Result">{renderObjectRows(output)}</ToolResultSection>
      ) : (
        <ToolResultSection title="Result">
          <p className="text-sm">{output === undefined ? "No output data." : String(output)}</p>
        </ToolResultSection>
      )}
    </ToolResultShell>
  );
}
