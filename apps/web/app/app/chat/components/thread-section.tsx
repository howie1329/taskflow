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
    <div className={cn("flex items-center gap-2 px-0.5", className)}>
      {icon}
      <span className="text-[11px] font-medium text-muted-foreground/70">
        {label}
      </span>
    </div>
  )
}
