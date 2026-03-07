"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface NoteSectionProps {
  label: string
  icon?: ReactNode
  className?: string
}

export function NoteSection({ label, icon, className }: NoteSectionProps) {
  return (
    <div className={cn("flex items-center gap-2 px-0.5", className)}>
      {icon}
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">
        {label}
      </span>
    </div>
  )
}
