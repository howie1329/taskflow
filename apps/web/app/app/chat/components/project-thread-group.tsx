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
      <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 px-2 py-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
        <span className="flex items-center gap-2 min-w-0">
          <span className="shrink-0">{project.icon}</span>
          <span className="truncate">{project.title}</span>
          <Badge
            variant="secondary"
            className="rounded-md text-[10px] h-4 px-1"
          >
            {threads.length}
          </Badge>
        </span>
        <ChevronDownIcon className="size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 pl-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
