"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface AddTaskCardProps {
  onClick?: () => void;
}

export function AddTaskCard({ onClick }: AddTaskCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        "flex cursor-pointer items-center gap-2 px-3 py-2.5 text-muted-foreground",
        "transition-[background-color,color] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "hover:bg-accent/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <HugeiconsIcon
        icon={Add01Icon}
        className="size-3.5 shrink-0 opacity-70"
      />
      <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
        <span className="truncate text-xs font-medium">Add task</span>
        <span className="text-[11px] text-muted-foreground/70">New</span>
      </div>
    </div>
  );
}
