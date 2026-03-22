"use client";

import type { Doc } from "@/convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { priorityDotClassName } from "@/lib/task-priority-styles";

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
  const project = task.projectId
    ? projects.find((p) => p._id === task.projectId)
    : null;

  const taskTags = task.tagIds
    .map((id) => tags.find((t) => t._id === id))
    .filter(Boolean) as Tag[];

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
      role="button"
      tabIndex={0}
      className={cn(
        "group cursor-pointer gap-0 rounded-none border-0 bg-transparent px-3 py-2.5 shadow-none ring-0",
        "transition-[background-color,border-color,color,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "hover:bg-accent/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "motion-safe:active:scale-[0.99]",
      )}
      onClick={() => onClick(task)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick(task)
        }
      }}
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            {project ? (
              <>
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: project.color }}
                  aria-hidden="true"
                />
                <span
                  className="truncate text-foreground/78"
                  title={project.title}
                >
                  {project.icon ? `${project.icon} ${project.title}` : project.title}
                </span>
              </>
            ) : (
              <span className="truncate">No project</span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {task.dueDate ? (
              <span
                className={cn(
                  "inline-flex h-5 items-center rounded-md border border-border bg-background px-1.5 text-[11px] font-medium tabular-nums text-muted-foreground",
                  isOverdue &&
                    "border-destructive/40 bg-destructive/8 text-destructive dark:border-destructive/50 dark:bg-destructive/12",
                )}
                title={new Date(task.dueDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              >
                {formatDate(task.dueDate)}
              </span>
            ) : null}

            <span
              className={cn(
                "size-1.5 rounded-full opacity-85",
                priorityDotClassName(task.priority),
              )}
              title={`Priority: ${task.priority}`}
              aria-label={`Priority: ${task.priority}`}
            />
          </div>
        </div>

        <h4
          className={cn(
            "text-sm font-medium leading-[1.35] tracking-[-0.01em] text-foreground",
            "line-clamp-2",
            isCompleted && "text-muted-foreground line-through decoration-muted-foreground/70",
          )}
        >
          {task.title}
        </h4>

        <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
          {taskTags.length > 0 ? (
            <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
              {taskTags.slice(0, 2).map((tag) => (
                <span
                  key={tag._id}
                  className="truncate rounded-sm bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
                  title={tag.name}
                >
                  {tag.name}
                </span>
              ))}
              {taskTags.length > 2 ? (
                <span className="shrink-0 tabular-nums">
                  +{taskTags.length - 2}
                </span>
              ) : null}
            </div>
          ) : (
            <span className="flex-1 truncate text-muted-foreground/70">
              {project ? "Task" : "Standalone task"}
            </span>
          )}

          {task.scheduledDate ? (
            <span className="shrink-0 rounded-sm border border-border/70 px-1.5 py-0.5 tabular-nums text-muted-foreground/90">
              {task.scheduledDate}
            </span>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
