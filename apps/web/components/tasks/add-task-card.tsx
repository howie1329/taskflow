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
        "cursor-pointer gap-0 rounded-none border-0 bg-transparent px-3 py-2 text-muted-foreground ring-0",
        "transition-[color,background-color,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "hover:bg-accent/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
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
      <div className="flex items-center gap-1.5">
        <HugeiconsIcon icon={Add01Icon} className="size-4 shrink-0" />
        <span className="text-xs font-medium">Add task</span>
      </div>
    </Card>
  );
}
