"use client";

import { Task, mockProjects, mockTags } from "./mock-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const project = task.projectId
    ? mockProjects[task.projectId as keyof typeof mockProjects]
    : null;
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
    if (diffDays === -1) return "Yesterday";
    if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
    if (diffDays > 1) return `${diffDays} days`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <Card
      className="p-3 cursor-pointer hover:bg-accent/50 transition-colors border-l-4"
      style={{ borderLeftColor: project?.color || "transparent" }}
      onClick={() => onClick(task)}
    >
      {/* Title */}
      <h4 className="text-sm font-medium leading-tight line-clamp-2 mb-2">
        {task.title}
      </h4>

      {/* Footer metadata */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Priority indicator */}
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            priorityColors[task.priority as keyof typeof priorityColors],
          )}
          title={`Priority: ${task.priority}`}
        />

        {/* Due date */}
        {task.dueDate && (
          <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
            {formatDate(task.dueDate)}
          </Badge>
        )}

        {/* Scheduled date */}
        {task.scheduledDate && !task.dueDate && (
          <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
            {task.scheduledDate === new Date().toISOString().split("T")[0]
              ? "Today"
              : task.scheduledDate}
          </Badge>
        )}

        {/* Project badge */}
        {project && (
          <Badge
            variant="outline"
            className="text-xs px-1.5 py-0 h-5"
            style={{ borderColor: project.color, color: project.color }}
          >
            {project.name}
          </Badge>
        )}

        {/* Tag dots */}
        {tags.slice(0, 3).map((tag, idx) => (
          <div
            key={idx}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: tag.color }}
            title={tag.name}
          />
        ))}
        {tags.length > 3 && (
          <span className="text-xs text-muted-foreground">
            +{tags.length - 3}
          </span>
        )}
      </div>

      {/* Energy level indicator */}
      {task.energyLevel && task.energyLevel !== "medium" && (
        <div className="mt-2 text-xs text-muted-foreground">
          {task.energyLevel === "high" ? "⚡ High energy" : "🪫 Low energy"}
        </div>
      )}
    </Card>
  );
}
