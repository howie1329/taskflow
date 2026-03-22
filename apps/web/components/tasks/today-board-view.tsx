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
    <div className="flex h-full w-full min-h-0 flex-col gap-3 overflow-y-auto lg:flex-row lg:overflow-hidden">
      <div className="flex min-h-[220px] min-w-[260px] flex-col overflow-hidden rounded-[18px] border border-border/70 bg-card/50 lg:min-h-0 lg:w-[31%] xl:w-[27%]">
        <div className="sticky top-0 z-10 flex min-h-10 shrink-0 items-center justify-between gap-2 border-b border-border/60 bg-background/92 px-3 py-2 backdrop-blur supports-backdrop-filter:bg-background/80">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="shrink-0 text-sm font-medium tracking-tight text-foreground">
              Today
            </h3>
            <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
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
              "shrink-0 rounded-md text-muted-foreground",
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

        <div className="min-h-0 flex-1 divide-y divide-border/40 overflow-y-auto">
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

      <div className="h-full min-h-[300px] min-w-0 flex-1">
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
