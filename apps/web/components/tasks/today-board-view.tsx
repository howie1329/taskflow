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
    <div className="h-full w-full min-h-0 flex flex-col lg:flex-row gap-4 overflow-y-auto lg:overflow-hidden">
      {/* Today Lane - Left side */}
      <div className="lg:w-[32%] xl:w-[28%] min-w-[260px] flex flex-col min-h-[200px] lg:min-h-0 rounded-xl border bg-card/40 dark:bg-card/20">
        {/* Today header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b bg-background/40 backdrop-blur supports-[backdrop-filter]:bg-background/30 shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium tracking-tight">Today</h3>
            <span className="text-[11px] tabular-nums text-muted-foreground bg-muted/70 px-2 py-0.5 rounded-md">
              {todayTasks.length}
            </span>
            <span className="text-[11px] text-muted-foreground">{today}</span>
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
        <div className="flex-1 min-h-0 space-y-2 px-3 py-2 lg:overflow-y-auto">
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
