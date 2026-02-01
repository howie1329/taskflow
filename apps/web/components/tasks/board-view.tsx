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
}: BoardViewProps) {
  const isMobile = useIsMobile();

  const getTasksByStatus = (status: string) => {
    return tasks
      .filter((task) => task.status === status)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  };

  return (
    <div className="h-full overflow-x-auto overflow-y-hidden">
      <div className="flex gap-4 h-full min-w-[880px] lg:min-w-0">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          const isCompleted = column.id === "Completed";

          return (
            <div
              key={column.id}
              className="flex flex-col flex-1 min-w-[220px] max-w-[360px] h-full"
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium">{column.label}</h3>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-none">
                    {columnTasks.length}
                  </span>
                </div>
                {!isCompleted ? (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className={cn("shrink-0", isMobile ? "size-8" : "size-7")}
                    onClick={() => onCreateTask({ status: column.id })}
                  >
                    <HugeiconsIcon icon={Add01Icon} className="size-4" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs px-2 shrink-0"
                    onClick={() => {
                      // TODO: Toggle completed visibility (Phase 5)
                      console.log("Toggle completed visibility");
                    }}
                  >
                    ✓ Hide
                  </Button>
                )}
              </div>

              {/* Task list with Add card */}
              <div
                className={cn(
                  "flex-1 overflow-y-auto space-y-2 p-1 -mx-1",
                  isCompleted && "opacity-75",
                )}
              >
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onClick={onTaskClick}
                    projects={projects}
                    tags={tags}
                  />
                ))}
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
