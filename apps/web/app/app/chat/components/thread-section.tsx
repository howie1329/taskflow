"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ThreadSectionProps {
  label: string
  count?: number
  icon?: ReactNode
  className?: string
}

export function ThreadSection({
  label,
  count,
  icon,
  className,
}: ThreadSectionProps) {
  return (
    <div className={cn("flex items-center gap-1.5 px-0.5", className)}>
      {icon}
      <span className="text-xs font-medium text-muted-foreground">
        {label}
        {count !== undefined ? (
          <span className="ml-1 tabular-nums text-muted-foreground/80">
            ({count})
          </span>
        ) : null}
      </span>
    </div>
  )
}
