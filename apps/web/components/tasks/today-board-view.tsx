"use client";

import type { Doc } from "@/convex/_generated/dataModel";
import { TaskCard } from "./task-card";
import { BoardView } from "./board-view";
import { AddTaskCard } from "./add-task-card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type Task = Doc<"tasks">;
type Project = Doc<"projects">;
type Tag = Doc<"tags">;

interface TodayBoardViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onCreateTask: (defaults: {
    status?: Task["status"];
    scheduledDate?: string | null;
  }) => void;
  projects?: Project[];
  tags?: Tag[];
  hideCompleted?: boolean;
}

export function TodayBoardView({
  tasks,
  onTaskClick,
  onCreateTask,
  projects = [],
  tags = [],
  hideCompleted = false,
}: TodayBoardViewProps) {
  const isMobile = useIsMobile();

  const today = new Date().toISOString().split("T")[0];

  const todayTasks = tasks
    .filter((task) => task.scheduledDate === today)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const boardTasks = tasks.filter(
    (task) => task.scheduledDate !== today || task.status === "Completed",
  );

  return (
    <div className="flex h-full w-full min-h-0 flex-col gap-4 overflow-y-auto lg:flex-row lg:gap-0 lg:overflow-hidden">
      <div
        className={cn(
          "flex min-h-[220px] min-w-0 flex-col overflow-hidden lg:min-h-0 lg:w-[31%] lg:shrink-0 lg:border-r lg:border-border/50 xl:w-[27%]",
        )}
      >
        <div className="flex min-h-9 shrink-0 items-center justify-between gap-2 border-b border-border/40 px-2 py-1.5">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="shrink-0 text-xs font-semibold tracking-tight text-foreground">
              Today
            </h3>
            <span className="shrink-0 tabular-nums text-[11px] text-muted-foreground">
              {todayTasks.length}
            </span>
            <span className="truncate text-[11px] tabular-nums text-muted-foreground">
              {today}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn(
              "shrink-0 text-muted-foreground",
              isMobile ? "size-8" : "size-7",
            )}
            onClick={() =>
              onCreateTask({ status: "To Do", scheduledDate: today })
            }
            aria-label="Add task for today"
          >
            <HugeiconsIcon icon={Add01Icon} />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {todayTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onClick={onTaskClick}
              projects={projects}
              tags={tags}
            />
          ))}
          <AddTaskCard
            onClick={() =>
              onCreateTask({ status: "To Do", scheduledDate: today })
            }
          />
        </div>
      </div>

      <div className="h-full min-h-[300px] min-w-0 flex-1 lg:min-h-0 lg:pl-3">
        <div className="h-full min-h-0">
          <BoardView
            tasks={boardTasks}
            onTaskClick={onTaskClick}
            onCreateTask={(defaults) => onCreateTask(defaults)}
            projects={projects}
            tags={tags}
            hideCompleted={hideCompleted}
          />
        </div>
      </div>
    </div>
  );
}
