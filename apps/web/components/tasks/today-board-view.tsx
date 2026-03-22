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

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // Get tasks scheduled for today
  const todayTasks = tasks
    .filter((task) => task.scheduledDate === today)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  // Get non-completed tasks for the board (to avoid duplication in Today lane)
  const boardTasks = tasks.filter(
    (task) => task.scheduledDate !== today || task.status === "Completed",
  );

  return (
    <div className="flex h-full w-full min-h-0 flex-col gap-4 overflow-y-auto lg:flex-row lg:overflow-hidden">
      {/* Today Lane - Left side */}
      <div className="flex min-h-[200px] min-w-[260px] flex-col overflow-hidden rounded-lg border border-border bg-card lg:min-h-0 lg:w-[32%] xl:w-[28%]">
        {/* Today header */}
        <div className="sticky top-0 z-10 flex min-h-8 shrink-0 items-center justify-between border-b border-border bg-card px-3 py-1">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="shrink-0 text-sm font-medium tracking-tight">Today</h3>
            <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
              {todayTasks.length}
            </span>
            <span className="truncate text-xs text-muted-foreground">{today}</span>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn("shrink-0", isMobile ? "size-8" : "size-7")}
            onClick={() =>
              onCreateTask({ status: "To Do", scheduledDate: today })
            }
          >
            <HugeiconsIcon icon={Add01Icon} className="size-4" />
          </Button>
        </div>

        {/* Today task list with Add card */}
        <div className="min-h-0 flex-1 divide-y divide-border overflow-y-auto">
          {todayTasks.map((task) => (
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
            onClick={() =>
              onCreateTask({ status: "To Do", scheduledDate: today })
            }
          />
        </div>
      </div>

      {/* Board View - Right side */}
      <div className="flex-1 h-full min-h-[300px] min-w-0">
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
