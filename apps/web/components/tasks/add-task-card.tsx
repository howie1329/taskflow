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
      className="p-2 cursor-pointer border border-dashed border-border/70 bg-transparent flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors rounded-lg"
      onClick={onClick}
    >
      <HugeiconsIcon icon={Add01Icon} className="size-4" />
      <span className="text-sm">Add task</span>
    </Card>
  );
}
