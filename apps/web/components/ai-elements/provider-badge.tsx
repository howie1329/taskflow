"use client";

import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { Clock, Database, Globe, Search } from "lucide-react";

export type ProviderType =
  | "massive"
  | "exa"
  | "parallel"
  | "tavily"
  | "firecrawl"
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
  massive: {
    name: "Massive",
    type: "massive",
    icon: <Database className="size-3" />,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
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
  github: {
    name: "GitHub",
    type: "github",
    icon: <Database className="size-3" />,
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
  },
  unknown: {
    name: "Taskflow",
    type: "unknown",
    icon: <Database className="size-3" />,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
};

function detectProvider(toolName: string): ProviderType {
  const lower = toolName.toLowerCase();
  if (
    lower.includes("massive") ||
    lower.includes("stock") ||
    lower.includes("market")
  )
    return "massive";
  if (lower.includes("exa")) return "exa";
  if (lower.includes("parallel") || lower.includes("deep")) return "parallel";
  if (lower.includes("tavily") || lower.includes("websearch")) return "tavily";
  if (lower.includes("firecrawl")) return "firecrawl";
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
