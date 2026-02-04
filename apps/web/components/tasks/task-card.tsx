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
      className="p-2.5 cursor-pointer rounded-lg border border-border/60 bg-card/60 dark:bg-card/40 shadow-sm shadow-black/5 hover:bg-accent/40 hover:border-border transition-[transform,box-shadow,background-color,border-color] hover:-translate-y-[1px]"
      onClick={() => onClick(task)}
    >
      {/* Top row: Project badge */}
      <div className="flex items-center justify-between mb-1.5">
        {project ? (
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 h-4 border-border/60 text-foreground/80"
            style={{ borderColor: project.color, color: project.color }}
          >
            <span className="mr-1">{project.icon}</span>
            {project.title}
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 h-4 text-muted-foreground border-border/60"
          >
            No project
          </Badge>
        )}

        {/* Due date + Priority */}
        <div className="flex items-center gap-1.5">
          {task.dueDate && (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-1 py-0 h-4 tabular-nums border-border/60 text-muted-foreground",
                isOverdue && "border-destructive text-destructive",
              )}
            >
              {formatDate(task.dueDate)}
            </Badge>
          )}
          <div
            className={cn(
              "w-1.5 h-1.5 rounded-full opacity-80",
              priorityColors[task.priority],
            )}
            title={`Priority: ${task.priority}`}
          />
        </div>
      </div>

      {/* Title */}
      <h4
        className={cn(
          "text-[13px] font-medium leading-snug line-clamp-2 mb-1.5",
          isCompleted && "line-through text-muted-foreground",
        )}
      >
        {task.title}
      </h4>

      {/* Bottom row: Tags + Scheduled */}
      <div className="flex items-center gap-1.5">
        {/* Tags */}
        {taskTags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap flex-1">
            {taskTags.slice(0, 2).map((tag, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="text-[10px] px-1 py-0 h-4 border border-transparent"
                style={{
                  backgroundColor: `${tag.color}20`,
                  color: tag.color,
                  borderColor: tag.color,
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
            className="text-[10px] px-1 py-0 h-4 shrink-0 text-muted-foreground"
          >
            {task.scheduledDate}
          </Badge>
        )}
      </div>
    </Card>
  );
}
