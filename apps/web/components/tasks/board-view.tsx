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
      <div className="grid gap-4 lg:h-full lg:grid-cols-4">
        {visibleColumns.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          const isCompleted = column.id === "Completed";

          return (
            <div
              key={column.id}
              className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card lg:min-h-0"
            >
              {/* Column header */}
              <div className="sticky top-0 z-10 flex min-h-8 shrink-0 items-center justify-between border-b border-border bg-card px-3 py-1">
                <div className="flex min-w-0 items-center gap-2">
                  <h3 className="truncate text-sm font-medium tracking-tight">
                    {column.label}
                  </h3>
                  <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                    {columnTasks.length}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className={cn("shrink-0", isMobile ? "size-8" : "size-7")}
                  onClick={() => onCreateTask({ status: column.id })}
                >
                  <HugeiconsIcon icon={Add01Icon} className="size-4" />
                </Button>
              </div>

              {/* Task list with Add card */}
              <div
                className={cn(
                  "min-h-0 flex-1 divide-y divide-border overflow-y-auto",
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
