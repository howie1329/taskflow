"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BoardView } from "@/components/tasks/board-view";
import { TodayBoardView } from "@/components/tasks/today-board-view";
import { TaskDetailsSheet } from "@/components/tasks/task-details-sheet";
import { CreateTaskSheet } from "@/components/tasks/create-task-sheet";
import { useViewer } from "@/components/settings/hooks/use-viewer";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";

type Task = Doc<"tasks">;

export default function TasksPage() {
  const { viewer, isLoading: isViewerLoading } = useViewer();
  const updatePreferences = useMutation(api.preferences.updateMyPreferences);

  // Fetch real tasks from Convex
  const tasks = useQuery(api.tasks.listMyTasks, {});
  const isTasksLoading = tasks === undefined;

  // View state - sync with preferences when they load
  const [currentView, setCurrentView] = useState<"board" | "todayPlusBoard">(
    "board",
  );

  // Sync view with preferences when they load (not just initial state)
  useEffect(() => {
    if (viewer?.preferences?.taskDefaultView) {
      setCurrentView(viewer.preferences.taskDefaultView);
    }
  }, [viewer?.preferences?.taskDefaultView]);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Create task sheet state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDefaults, setCreateDefaults] = useState<{
    status?: Task["status"];
    scheduledDate?: string | null;
  }>({});

  const handleViewChange = async (newView: "board" | "todayPlusBoard") => {
    setCurrentView(newView);

    // Persist the view change to Convex
    if (viewer?.userId) {
      try {
        await updatePreferences({ taskDefaultView: newView });
      } catch (error) {
        console.error("Failed to save view preference:", error);
      }
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailsOpen(true);
  };

  const handleOpenCreate = (defaults: {
    status?: Task["status"];
    scheduledDate?: string | null;
  }) => {
    setCreateDefaults(defaults);
    setIsCreateOpen(true);
  };

  const handleCreateTask = (
    draft: Omit<Task, "_id" | "_creationTime" | "createdAt" | "updatedAt">,
  ) => {
    // TODO: Phase 2 - create via Convex mutation
    // For now, just close the sheet
    setIsCreateOpen(false);
  };

  // Combined loading state
  const isLoading = isViewerLoading || isTasksLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 h-full">
        <div className="flex items-center justify-between shrink-0">
          <p className="text-sm text-muted-foreground">
            Organize and track your work
          </p>
        </div>
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex flex-col gap-4 h-full">
        {/* Header with view switcher */}
        <div className="flex items-center justify-between shrink-0">
          <p className="text-sm text-muted-foreground">
            Organize and track your work
          </p>
          <Tabs
            value={currentView}
            onValueChange={(v) =>
              handleViewChange(v as "board" | "todayPlusBoard")
            }
          >
            <TabsList>
              <TabsTrigger value="board">Board</TabsTrigger>
              <TabsTrigger value="todayPlusBoard">Today + Board</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Empty state */}
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-2 text-center max-w-sm">
            <h3 className="text-sm font-medium">No tasks yet</h3>
            <p className="text-xs text-muted-foreground">
              Create your first task to get started
            </p>
            <button
              onClick={() => handleOpenCreate({ status: "Not Started" })}
              className="mt-4 px-3 py-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Add your first task
            </button>
          </div>
        </div>

        {/* Task details sheet */}
        <TaskDetailsSheet
          task={selectedTask}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
        />

        {/* Create task sheet */}
        <CreateTaskSheet
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          defaults={createDefaults}
          onCreate={handleCreateTask}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header with view switcher */}
      <div className="flex items-center justify-between shrink-0">
        <p className="text-sm text-muted-foreground">
          Organize and track your work
        </p>
        <Tabs
          value={currentView}
          onValueChange={(v) =>
            handleViewChange(v as "board" | "todayPlusBoard")
          }
        >
          <TabsList>
            <TabsTrigger value="board">Board</TabsTrigger>
            <TabsTrigger value="todayPlusBoard">Today + Board</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main content area */}
      <div className="flex-1 min-h-0">
        {currentView === "board" ? (
          <BoardView
            tasks={tasks}
            onTaskClick={handleTaskClick}
            onCreateTask={handleOpenCreate}
          />
        ) : (
          <TodayBoardView
            tasks={tasks}
            onTaskClick={handleTaskClick}
            onCreateTask={handleOpenCreate}
          />
        )}
      </div>

      {/* Task details sheet */}
      <TaskDetailsSheet
        task={selectedTask}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />

      {/* Create task sheet */}
      <CreateTaskSheet
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        defaults={createDefaults}
        onCreate={handleCreateTask}
      />
    </div>
  );
}
