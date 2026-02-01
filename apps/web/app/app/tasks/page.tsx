"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BoardView } from "@/components/tasks/board-view";
import { TodayBoardView } from "@/components/tasks/today-board-view";
import { TaskDetailsSheet } from "@/components/tasks/task-details-sheet";
import { CreateTaskSheet } from "@/components/tasks/create-task-sheet";
import { mockTasks, Task } from "@/components/tasks/mock-data";
import { useViewer } from "@/components/settings/hooks/use-viewer";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function TasksPage() {
  const { viewer, isLoading } = useViewer();
  const updatePreferences = useMutation(api.preferences.updateMyPreferences);

  // Tasks state (UI-only, in-memory)
  const [tasks, setTasks] = useState<Task[]>(mockTasks);

  const [currentView, setCurrentView] = useState<"board" | "todayPlusBoard">(
    () => viewer?.preferences?.taskDefaultView ?? "board",
  );
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
    draft: Omit<Task, "_id" | "createdAt" | "updatedAt">,
  ) => {
    // Generate a unique ID for the new task
    const newTaskId = `task-${Date.now()}`;
    const now = Date.now();

    const newTask = {
      _id: newTaskId,
      ...draft,
      createdAt: now,
      updatedAt: now,
    } as Task;

    // Add to tasks array
    setTasks((prev) => [newTask, ...prev]);

    // Close create sheet and open details sheet
    setIsCreateOpen(false);
    setSelectedTask(newTask);
    setIsDetailsOpen(true);
  };

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
