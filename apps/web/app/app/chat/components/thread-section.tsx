"use client"

import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
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
    <div className={cn("flex items-center gap-2 px-1", className)}>
      {icon}
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {typeof count === "number" && (
        <Badge
          variant="secondary"
          className="rounded-none text-[10px] h-4 px-1"
        >
          {count}
        </Badge>
      )}
    </div>
  )
}
