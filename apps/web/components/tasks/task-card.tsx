"use client";

import type { Doc } from "@/convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Task = Doc<"tasks">;

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

// TODO: Phase 4 - fetch real tags and projects
const mockTags: Record<string, { name: string; color: string }> = {};

export function TaskCard({ task, onClick }: TaskCardProps) {
  // TODO: Phase 4 - use real tags
  const tags = task.tagIds
    .map((id) => mockTags[id as unknown as string])
    .filter(Boolean);

  const priorityColors = {
    low: "bg-blue-500",
    medium: "bg-amber-500",
    high: "bg-red-500",
  };

  const formatDate = (timestamp: number | null | undefined) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    const today = new Date();
    const diffDays = Math.ceil(
      (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 0) return "Overdue";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  // Format project ID for display (will be replaced with real project name in Phase 4)
  const projectDisplay = task.projectId ? "Project" : "No project";

  return (
    <Card
      className="p-2 cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={() => onClick(task)}
    >
      {/* Top row: Project badge */}
      <div className="flex items-center justify-between mb-1.5">
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
          {projectDisplay}
        </Badge>

        {/* Due date + Priority */}
        <div className="flex items-center gap-1.5">
          {task.dueDate && (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-1 py-0 h-4",
                isOverdue && "border-destructive text-destructive",
              )}
            >
              {formatDate(task.dueDate)}
            </Badge>
          )}
          <div
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              priorityColors[task.priority],
            )}
            title={`Priority: ${task.priority}`}
          />
        </div>
      </div>

      {/* Title */}
      <h4 className="text-sm font-medium leading-tight line-clamp-2 mb-1.5">
        {task.title}
      </h4>

      {/* Bottom row: Tags + Scheduled */}
      <div className="flex items-center gap-1.5">
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap flex-1">
            {tags.slice(0, 2).map((tag, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="text-[10px] px-1 py-0 h-4"
              >
                {tag.name}
              </Badge>
            ))}
            {tags.length > 2 && (
              <span className="text-[10px] text-muted-foreground">
                +{tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Scheduled date */}
        {task.scheduledDate && (
          <Badge
            variant="secondary"
            className="text-[10px] px-1 py-0 h-4 shrink-0"
          >
            {task.scheduledDate}
          </Badge>
        )}
      </div>
    </Card>
  );
}
