"use client";

import type { ReactNode } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { ChatProject, ChatThread } from "./thread-types";

interface ProjectThreadGroupProps {
  project: ChatProject;
  threads: ChatThread[];
  children: ReactNode;
  className?: string;
}

export function ProjectThreadGroup({
  project,
  threads,
  children,
  className,
}: ProjectThreadGroupProps) {
  return (
    <Collapsible defaultOpen className={cn("space-y-1", className)}>
      <CollapsibleTrigger className="group flex h-8 min-h-8 w-full items-center justify-between gap-1.5 rounded-md px-3 text-left text-xs font-medium text-muted-foreground transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
        <span className="flex min-w-0 flex-1 items-center gap-1.5">
          <span className="shrink-0">{project.icon}</span>
          <span className="min-w-0 flex-1 truncate">{project.title}</span>
          <Badge
            variant="secondary"
            className="h-4 rounded-sm border-0 bg-transparent px-0.5 text-[10px] text-muted-foreground"
          >
            {threads.length}
          </Badge>
        </span>
        <ChevronDownIcon className="size-3 shrink-0 transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-0.5 pl-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
