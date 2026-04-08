"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface NoteSectionProps {
  label: string
  count?: number
  icon?: ReactNode
  className?: string
}

export function NoteSection({ label, count, icon, className }: NoteSectionProps) {
  return (
    <div className={cn("flex items-center gap-1.5 px-0.5", className)}>
      {icon}
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
        {typeof count === "number" ? (
          <span className="ml-1 normal-case tabular-nums tracking-normal text-muted-foreground/80">
            ({count})
          </span>
        ) : null}
      </span>
    </div>
  )
}
