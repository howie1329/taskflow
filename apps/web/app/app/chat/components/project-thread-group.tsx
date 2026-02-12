"use client"

import type { ReactNode } from "react"
import { ChevronDownIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import type { ChatProject, ChatThread } from "./mock-data"

interface ProjectThreadGroupProps {
  project: ChatProject
  threads: ChatThread[]
  children: ReactNode
  className?: string
}

export function ProjectThreadGroup({
  project,
  threads,
  children,
  className,
}: ProjectThreadGroupProps) {
  return (
    <Collapsible defaultOpen className={cn("space-y-1", className)}>
      <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 rounded-sm px-2 py-2 text-left text-[11px] font-medium text-muted-foreground/80 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
        <span className="flex items-center gap-2 min-w-0">
          <span className="shrink-0">{project.icon}</span>
          <span className="truncate">{project.title}</span>
          <Badge
            variant="secondary"
            className="h-4 rounded-sm border-0 bg-transparent px-0.5 text-[10px] text-muted-foreground"
          >
            {threads.length}
          </Badge>
        </span>
        <ChevronDownIcon className="size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-0.5 pl-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
