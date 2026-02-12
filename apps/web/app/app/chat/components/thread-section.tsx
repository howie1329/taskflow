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
  count: _count,
  icon,
  className,
}: ThreadSectionProps) {
  return (
    <div className={cn("flex items-center gap-2 px-1", className)}>
      {icon}
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80">
        {label}
      </span>
    </div>
  )
}
