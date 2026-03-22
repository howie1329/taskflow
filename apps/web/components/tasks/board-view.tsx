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

  // Filter out Completed column if hideCompleted is true
  const visibleColumns = hideCompleted
    ? columns.filter((c) => c.id !== "Completed")
    : columns;

  return (
    <div className="h-full w-full min-h-0 overflow-y-auto lg:overflow-y-hidden">
      <div
        className={cn(
          "grid gap-3 pb-1 lg:h-full lg:gap-0 lg:overflow-hidden lg:rounded-[20px] lg:border lg:border-border/70 lg:bg-card/45",
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
                "flex min-w-0 flex-col overflow-hidden rounded-[18px] border border-border/70 bg-card/50",
                "lg:min-h-0 lg:rounded-none lg:border-0 lg:border-l lg:border-border/60 lg:bg-transparent",
                "lg:first:border-l-0",
              )}
            >
              <div className="sticky top-0 z-10 flex min-h-10 shrink-0 items-center justify-between gap-2 border-b border-border/60 bg-background/92 px-3 py-2 backdrop-blur supports-backdrop-filter:bg-background/80 lg:bg-card/75 lg:supports-backdrop-filter:bg-card/70">
                <div className="flex min-w-0 items-center gap-2">
                  <h3 className="truncate text-sm font-medium tracking-tight text-foreground">
                    {column.label}
                  </h3>
                  <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
                    {columnTasks.length}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className={cn(
                    "shrink-0 rounded-md text-muted-foreground",
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
                  "min-h-0 flex-1 divide-y divide-border/40 overflow-y-auto bg-transparent",
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
                {/* Always show Add task card at bottom */}
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
