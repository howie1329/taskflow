"use client";

import type { Doc } from "@/convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Task = Doc<"tasks">;
type Project = Doc<"projects">;
type Tag = Doc<"tags">;

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
  projects?: Project[];
  tags?: Tag[];
}

export function TaskCard({
  task,
  onClick,
  projects = [],
  tags = [],
}: TaskCardProps) {
  // Find the project for this task
  const project = task.projectId
    ? projects.find((p) => p._id === task.projectId)
    : null;

  // Find the tags for this task
  const taskTags = task.tagIds
    .map((id) => tags.find((t) => t._id === id))
    .filter(Boolean) as Tag[];

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
  const isCompleted = task.status === "Completed";

  return (
    <Card
      className="group cursor-pointer rounded-none border-0 bg-transparent px-2.5 py-2 shadow-none ring-0 transition-colors hover:bg-muted/45 focus-visible:outline-none"
      onClick={() => onClick(task)}
    >
      {/* Top row: Project badge */}
      <div className="mb-1 flex items-center justify-between gap-2">
        {project ? (
          <Badge
            variant="outline"
            className="h-4 max-w-[55%] truncate border-border/40 px-1.5 py-0 text-[10px] text-foreground/75"
            style={{ borderColor: project.color, color: project.color }}
          >
            <span className="mr-1">{project.icon}</span>
            {project.title}
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="h-4 border-border/40 px-1.5 py-0 text-[10px] text-muted-foreground"
          >
            No project
          </Badge>
        )}

        {/* Due date + Priority */}
        <div className="flex items-center gap-1">
          {task.dueDate && (
            <Badge
              variant="outline"
              className={cn(
                "h-4 shrink-0 border-border/40 px-1 py-0 text-[10px] tabular-nums text-muted-foreground",
                isOverdue && "border-destructive text-destructive",
              )}
            >
              {formatDate(task.dueDate)}
            </Badge>
          )}
          <div
            className={cn(
              "h-1.5 w-1.5 rounded-full opacity-70",
              priorityColors[task.priority],
            )}
            title={`Priority: ${task.priority}`}
          />
        </div>
      </div>

      {/* Title */}
      <h4
        className={cn(
          "mb-0.5 text-[13px] font-medium leading-snug line-clamp-2",
          isCompleted && "line-through text-muted-foreground",
        )}
      >
        {task.title}
      </h4>

      {/* Bottom row: Tags + Scheduled */}
      <div className="flex items-center gap-1">
        {/* Tags */}
        {taskTags.length > 0 && (
          <div className="flex flex-1 items-center gap-1 overflow-hidden">
            {taskTags.slice(0, 2).map((tag, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="h-4 max-w-[90px] truncate border border-transparent px-1 py-0 text-[10px]"
                style={{
                  backgroundColor: `${tag.color}14`,
                  color: tag.color,
                  borderColor: `${tag.color}66`,
                }}
              >
                {tag.name}
              </Badge>
            ))}
            {taskTags.length > 2 && (
              <span className="text-[10px] text-muted-foreground tabular-nums">
                +{taskTags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Scheduled date */}
        {task.scheduledDate && (
          <Badge
            variant="secondary"
            className="h-4 shrink-0 px-1 py-0 text-[10px] text-muted-foreground/90"
          >
            {task.scheduledDate}
          </Badge>
        )}
      </div>
    </Card>
  );
}
