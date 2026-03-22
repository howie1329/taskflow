"use client";

import { Card } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface AddTaskCardProps {
  onClick?: () => void;
}

export function AddTaskCard({ onClick }: AddTaskCardProps) {
  return (
    <Card
      role="button"
      tabIndex={0}
      className={cn(
        "group cursor-pointer gap-0 rounded-none border-0 bg-transparent px-3 py-2.5 text-muted-foreground ring-0",
        "transition-[background-color,border-color,color,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "hover:bg-accent/45 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "motion-safe:active:scale-[0.99]",
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick?.()
        }
      }}
    >
      <div className="flex items-center gap-2">
        <span className="flex size-5 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background text-muted-foreground transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:border-border group-hover:text-foreground">
          <HugeiconsIcon icon={Add01Icon} className="size-3.5 shrink-0" />
        </span>
        <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
          <span className="truncate text-sm font-medium text-muted-foreground transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-foreground">
            Add task
          </span>
          <span className="text-[11px] text-muted-foreground/70">
            New
          </span>
        </div>
      </div>
    </Card>
  );
}
