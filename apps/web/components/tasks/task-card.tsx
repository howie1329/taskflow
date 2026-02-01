"use client";

import { Task, mockTags } from "./mock-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const tags = task.tagIds
    .map((id) => mockTags[id as keyof typeof mockTags])
    .filter(Boolean);

  const priorityColors = {
    low: "bg-blue-500",
    medium: "bg-amber-500",
    high: "bg-red-500",
  };

  const formatDate = (timestamp: number | null) => {
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

  return (
    <Card
      className="p-3 cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={() => onClick(task)}
    >
      {/* Title */}
      <h4 className="text-sm font-medium leading-tight line-clamp-2 mb-2">
        {task.title}
      </h4>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap mb-2">
          {tags.slice(0, 3).map((tag, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="text-xs px-1.5 py-0 h-5"
            >
              {tag.name}
            </Badge>
          ))}
          {tags.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Meta row */}
      <div className="flex items-center justify-between">
        {/* Left: Project + Scheduled */}
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
            {task.projectId || "No project"}
          </Badge>
          {task.scheduledDate && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
              {task.scheduledDate}
            </Badge>
          )}
        </div>

        {/* Right: Due date + Priority */}
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs px-1.5 py-0 h-5",
                isOverdue && "border-destructive text-destructive",
              )}
            >
              {formatDate(task.dueDate)}
            </Badge>
          )}
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              priorityColors[task.priority as keyof typeof priorityColors],
            )}
            title={`Priority: ${task.priority}`}
          />
        </div>
      </div>
    </Card>
  );
}
