"use client";

import { Card } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";

interface AddTaskCardProps {
  onClick?: () => void;
}

export function AddTaskCard({ onClick }: AddTaskCardProps) {
  return (
    <Card
      className="cursor-pointer rounded-none border-0 bg-transparent px-2.5 py-2 text-muted-foreground ring-0 transition-colors hover:bg-muted/35 hover:text-foreground"
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <HugeiconsIcon icon={Add01Icon} className="size-4" />
        <span className="text-[11px]">Add task</span>
      </div>
    </Card>
  );
}
