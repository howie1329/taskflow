"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { DynamicToolUIPart, ToolUIPart } from "ai";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  CircleIcon,
  ClockIcon,
  XCircleIcon,
} from "lucide-react";
import { useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import { isValidElement } from "react";
import { CodeBlock } from "./code-block";
import { ProviderBadge, TimingBadge } from "./provider-badge";

export type ToolProps = ComponentProps<typeof Collapsible>;

export const Tool = ({ className, ...props }: ToolProps) => (
  <Collapsible
    className={cn(
      "group not-prose w-full rounded-md border border-border/50 bg-background/40",
      className,
    )}
    {...props}
  />
);

export type ToolPart = ToolUIPart | DynamicToolUIPart;

export const getStatusBadge = (status: ToolPart["state"]) => {
  const labels: Record<ToolPart["state"], string> = {
    "input-streaming": "Pending",
    "input-available": "Running",
    "approval-requested": "Awaiting",
    "approval-responded": "Approved",
    "output-available": "Done",
    "output-error": "Error",
    "output-denied": "Denied",
  };

  const icons: Record<ToolPart["state"], ReactNode> = {
    "input-streaming": <CircleIcon className="size-3" />,
    "input-available": <ClockIcon className="size-3 animate-pulse" />,
    "approval-requested": <ClockIcon className="size-3" />,
    "approval-responded": <CheckCircleIcon className="size-3" />,
    "output-available": <CheckCircleIcon className="size-3" />,
    "output-error": <XCircleIcon className="size-3" />,
    "output-denied": <XCircleIcon className="size-3" />,
  };

  const variantMap: Record<ToolPart["state"], string> = {
    "input-streaming": "bg-muted text-muted-foreground border-border/40",
    "input-available": "bg-muted text-muted-foreground border-border/40",
    "approval-requested": "bg-muted text-muted-foreground border-border/40",
    "approval-responded": "bg-muted text-muted-foreground border-border/40",
    "output-available": "bg-muted text-muted-foreground border-border/40",
    "output-error": "bg-destructive/10 text-destructive border-destructive/20",
    "output-denied": "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <Badge
      className={cn(
        "gap-1 rounded-full text-[10px] px-2 h-5 border font-medium",
        variantMap[status],
      )}
      variant="outline"
    >
      {icons[status]}
      {labels[status]}
    </Badge>
  );
};

// Enhanced Tool Header with timing and provider info
export interface EnhancedToolHeaderProps {
  toolName: string;
  state: ToolPart["state"];
  title?: string;
  duration?: number;
  className?: string;
}

export const EnhancedToolHeader = ({
  toolName,
  state,
  title,
  duration,
  className,
  ...props
}: EnhancedToolHeaderProps) => {
  const displayName =
    title ??
    toolName.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

  return (
    <CollapsibleTrigger
      className={cn(
        "flex w-full items-center justify-between gap-3 px-3 py-2 text-xs transition-colors hover:bg-muted/40",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-medium truncate">{displayName}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {duration !== undefined && state === "output-available" && (
          <TimingBadge duration={duration} />
        )}
        <ProviderBadge toolName={toolName} />
        {getStatusBadge(state)}
        <ChevronDownIcon className="size-3 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
      </div>
    </CollapsibleTrigger>
  );
};

// Legacy ToolHeader for backward compatibility
export type ToolHeaderProps = {
  title?: string;
  className?: string;
} & (
  | { type: ToolUIPart["type"]; state: ToolUIPart["state"]; toolName?: never }
  | {
      type: DynamicToolUIPart["type"];
      state: DynamicToolUIPart["state"];
      toolName: string;
    }
);

export const ToolHeader = ({
  className,
  title,
  type,
  state,
  toolName,
  ...props
}: ToolHeaderProps) => {
  const derivedName =
    type === "dynamic-tool" ? toolName : type.split("-").slice(1).join("-");

  return (
    <CollapsibleTrigger
      className={cn(
        "flex w-full items-center justify-between gap-3 px-3 py-2 text-xs transition-colors hover:bg-muted/50",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium">{title ?? derivedName}</span>
      </div>
      <div className="flex items-center gap-2">
        {getStatusBadge(state)}
        <ChevronDownIcon className="size-3 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
      </div>
    </CollapsibleTrigger>
  );
};

export type ToolContentProps = ComponentProps<typeof CollapsibleContent>;

export const ToolContent = ({ className, ...props }: ToolContentProps) => (
  <CollapsibleContent
    className={cn(
      "px-3 pb-2.5",
      "data-[state=closed]:animate-out data-[state=open]:animate-in",
      className,
    )}
    {...props}
  />
);

export type ToolSummaryBarProps = ComponentProps<"div"> & {
  summary?: ReactNode;
  label?: string;
};

export const ToolSummaryBar = ({
  className,
  summary,
  label = "Summary",
  ...props
}: ToolSummaryBarProps) => {
  if (!summary) return null;

  return (
    <div
      className={cn(
        "rounded-md border border-border/40 bg-muted/20 px-3 py-1.5",
        "text-xs text-foreground",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground uppercase tracking-wide text-[10px]">
          {label}
        </span>
        <span className="font-medium truncate">{summary}</span>
      </div>
    </div>
  );
};

export type ToolMetaItem = {
  label: string;
  value: ReactNode;
};

export type ToolMetaPanelProps = ComponentProps<"div"> & {
  title?: string;
  items: ToolMetaItem[];
};

export const ToolMetaPanel = ({
  className,
  title = "Metadata",
  items,
  ...props
}: ToolMetaPanelProps) => {
  if (!items.length) return null;

  return (
    <div
      className={cn(
        "rounded-md border border-border/40 bg-muted/10",
        "px-3 py-2 text-xs",
        className,
      )}
      {...props}
    >
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">
        {title}
      </div>
      <div className="grid gap-2">
        {items.map((item, index) => (
          <div
            key={`${item.label}-${index}`}
            className="flex items-center justify-between gap-3"
          >
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium text-foreground truncate">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export type ToolRawPayloadProps = {
  input?: unknown;
  output?: unknown;
  className?: string;
};

export const ToolRawPayload = ({
  input,
  output,
  className,
}: ToolRawPayloadProps) => {
  const [activeTab, setActiveTab] = useState<"input" | "output">("output");
  const hasInput = input !== undefined;
  const hasOutput = output !== undefined;

  if (!hasInput && !hasOutput) return null;

  const resolvedTab =
    activeTab === "input" && !hasInput
      ? "output"
      : activeTab === "output" && !hasOutput
        ? "input"
        : activeTab;

  const code = JSON.stringify(
    resolvedTab === "input" ? input ?? null : output ?? null,
    null,
    2,
  );

  return (
    <Collapsible className={cn("group rounded-md border border-border/40", className)}>
      <CollapsibleTrigger className="flex w-full items-center justify-between px-2.5 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground">
        <span className="font-medium">Advanced: raw payload</span>
        <ChevronDownIcon className="size-3.5 transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 px-2.5 pb-2.5">
        <div className="flex items-center gap-1">
          {hasOutput ? (
            <Button
              size="sm"
              variant={resolvedTab === "output" ? "secondary" : "ghost"}
              className="h-6 px-2 text-[11px]"
              onClick={() => setActiveTab("output")}
              type="button"
            >
              Output
            </Button>
          ) : null}
          {hasInput ? (
            <Button
              size="sm"
              variant={resolvedTab === "input" ? "secondary" : "ghost"}
              className="h-6 px-2 text-[11px]"
              onClick={() => setActiveTab("input")}
              type="button"
            >
              Input
            </Button>
          ) : null}
        </div>
        <div className="overflow-hidden rounded-sm border border-border/50 bg-muted/20">
          <CodeBlock code={code} language="json" />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export type ToolInputProps = ComponentProps<"div"> & {
  input: ToolPart["input"];
};

export const ToolInput = ({ className, input, ...props }: ToolInputProps) => (
  <div className={cn("space-y-2 overflow-hidden p-4", className)} {...props}>
    <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
      Parameters
    </h4>
    <div className="rounded-md bg-muted/50">
      <CodeBlock code={JSON.stringify(input, null, 2)} language="json" />
    </div>
  </div>
);

export type ToolOutputProps = ComponentProps<"div"> & {
  output: ToolPart["output"];
  errorText: ToolPart["errorText"];
};

export const ToolOutput = ({
  className,
  output,
  errorText,
  ...props
}: ToolOutputProps) => {
  if (!(output || errorText)) {
    return null;
  }

  let Output = <div>{output as ReactNode}</div>;

  if (typeof output === "object" && !isValidElement(output)) {
    Output = (
      <CodeBlock code={JSON.stringify(output, null, 2)} language="json" />
    );
  } else if (typeof output === "string") {
    Output = <CodeBlock code={output} language="json" />;
  }

  return (
    <div className={cn("space-y-2 p-4", className)} {...props}>
      <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
        {errorText ? "Error" : "Result"}
      </h4>
      <div
        className={cn(
          "overflow-x-auto rounded-md text-xs [&_table]:w-full",
          errorText
            ? "bg-destructive/10 text-destructive"
            : "bg-muted/50 text-foreground",
        )}
      >
        {errorText && <div>{errorText}</div>}
        {Output}
      </div>
    </div>
  );
};
