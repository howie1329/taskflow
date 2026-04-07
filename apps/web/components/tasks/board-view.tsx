"use client";

import type { Doc } from "@/convex/_generated/dataModel";
import { TaskCard } from "./task-card";
import { AddTaskCard } from "./add-task-card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type Task = Doc<"tasks">;
type Project = Doc<"projects">;
type Tag = Doc<"tags">;

interface BoardViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onCreateTask: (defaults: { status: Task["status"] }) => void;
  projects?: Project[];
  tags?: Tag[];
  hideCompleted?: boolean;
}

const columns = [
  { id: "Not Started", label: "Not Started" },
  { id: "To Do", label: "To Do" },
  { id: "In Progress", label: "In Progress" },
  { id: "Completed", label: "Completed" },
] as const;

export function BoardView({
  tasks,
  onTaskClick,
  onCreateTask,
  projects = [],
  tags = [],
  hideCompleted = false,
}: BoardViewProps) {
  const isMobile = useIsMobile();

  const getTasksByStatus = (status: string) => {
    return tasks
      .filter((task) => task.status === status)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  };

  const visibleColumns = hideCompleted
    ? columns.filter((c) => c.id !== "Completed")
    : columns;

  return (
    <div className="h-full w-full min-h-0 overflow-y-auto lg:overflow-y-hidden">
      <div
        className={cn(
          "flex flex-col gap-4 pb-1 lg:h-full lg:grid lg:gap-0 lg:overflow-hidden",
          visibleColumns.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4",
        )}
      >
        {visibleColumns.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          const isCompleted = column.id === "Completed";

          return (
            <div
              key={column.id}
              className={cn(
                "flex min-w-0 flex-col overflow-hidden",
                "lg:min-h-0 lg:border-l lg:border-border/50",
                "lg:first:border-l-0",
              )}
            >
              <div className="flex min-h-9 shrink-0 items-center justify-between gap-2 border-b border-border/40 px-2 py-1.5">
                <div className="flex min-w-0 items-center gap-2">
                  <h3 className="truncate text-xs font-semibold tracking-tight text-foreground">
                    {column.label}
                  </h3>
                  <span className="shrink-0 tabular-nums text-[11px] text-muted-foreground">
                    {columnTasks.length}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className={cn(
                    "shrink-0 text-muted-foreground",
                    isMobile ? "size-8" : "size-7",
                  )}
                  onClick={() => onCreateTask({ status: column.id })}
                  aria-label={`Add task to ${column.label}`}
                >
                  <HugeiconsIcon icon={Add01Icon} />
                </Button>
              </div>

              <div
                className={cn(
                  "min-h-0 flex-1 overflow-y-auto bg-transparent",
                  isCompleted && "text-muted-foreground",
                )}
              >
                {columnTasks.map((task) => {
                  return (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onClick={onTaskClick}
                      projects={projects}
                      tags={tags}
                    />
                  );
                })}
                <AddTaskCard
                  onClick={() => onCreateTask({ status: column.id })}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
