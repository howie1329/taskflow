"use client";

import { cn } from "@/lib/utils";
import { TASKFLOW_TOOL_KEYS } from "@/lib/AITools/taskflow-tool-keys";
import { useMemo } from "react";
import { Clock, Database, Globe, Search } from "lucide-react";

export type ProviderType =
  | "taskflow"
  | "exa"
  | "parallel"
  | "tavily"
  | "firecrawl"
  | "valyu"
  | "supermemory"
  | "github"
  | "unknown";

interface ProviderInfo {
  name: string;
  type: ProviderType;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const providerConfig: Record<ProviderType, ProviderInfo> = {
  taskflow: {
    name: "Taskflow",
    type: "taskflow",
    icon: <Database className="size-3" />,
    color: "text-sky-600",
    bgColor: "bg-sky-500/10",
  },
  exa: {
    name: "Exa",
    type: "exa",
    icon: <Search className="size-3" />,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  parallel: {
    name: "Parallel",
    type: "parallel",
    icon: <Globe className="size-3" />,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  tavily: {
    name: "Tavily",
    type: "tavily",
    icon: <Search className="size-3" />,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  firecrawl: {
    name: "Firecrawl",
    type: "firecrawl",
    icon: <Globe className="size-3" />,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  valyu: {
    name: "Valyu",
    type: "valyu",
    icon: <Search className="size-3" />,
    color: "text-cyan-600",
    bgColor: "bg-cyan-500/10",
  },
  supermemory: {
    name: "Supermemory",
    type: "supermemory",
    icon: <Database className="size-3" />,
    color: "text-violet-600",
    bgColor: "bg-violet-500/10",
  },
  github: {
    name: "GitHub",
    type: "github",
    icon: <Database className="size-3" />,
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
  },
  unknown: {
    name: "Unknown",
    type: "unknown",
    icon: <Database className="size-3" />,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
};

function detectProvider(toolName: string): ProviderType {
  const toolKey = toolName.replace(/^tool-/, "");
  const lower = toolKey.toLowerCase();

  if (TASKFLOW_TOOL_KEYS.includes(toolKey as (typeof TASKFLOW_TOOL_KEYS)[number])) {
    return "taskflow";
  }
  if (lower.startsWith("valyu")) return "valyu";
  if (lower.startsWith("exa")) return "exa";
  if (lower.startsWith("parallel")) return "parallel";
  if (lower.startsWith("tavily")) return "tavily";
  if (lower.startsWith("firecrawl")) return "firecrawl";
  if (lower.startsWith("supermemory")) return "supermemory";
  if (lower.includes("github")) return "github";
  return "unknown";
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 10000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms / 1000)}s`;
}

function getDurationColor(ms: number): string {
  if (ms < 500) return "text-emerald-500";
  if (ms < 2000) return "text-amber-500";
  return "text-rose-500";
}

interface ProviderBadgeProps {
  toolName: string;
  showName?: boolean;
  size?: "sm" | "md";
}

export function ProviderBadge({
  toolName,
  showName = true,
  size = "sm",
}: ProviderBadgeProps) {
  const provider = useMemo(() => {
    const type = detectProvider(toolName);
    return providerConfig[type];
  }, [toolName]);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        provider.bgColor,
        provider.color,
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
      )}
    >
      {provider.icon}
      {showName && <span>{provider.name}</span>}
    </span>
  );
}

interface TimingBadgeProps {
  duration: number;
  size?: "sm" | "md";
}

export function TimingBadge({ duration, size = "sm" }: TimingBadgeProps) {
  const colorClass = getDurationColor(duration);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-muted font-mono tabular-nums",
        colorClass,
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs",
      )}
    >
      <Clock className="size-3" />
      {formatDuration(duration)}
    </span>
  );
}

export { detectProvider, formatDuration, getDurationColor, providerConfig };
export type { ProviderInfo };
