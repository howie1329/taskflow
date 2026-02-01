"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BoardView } from "@/components/tasks/board-view";
import { TodayBoardView } from "@/components/tasks/today-board-view";
import { TaskDetailsSheet } from "@/components/tasks/task-details-sheet";
import { mockTasks } from "@/components/tasks/mock-data";
import { useViewer } from "@/components/settings/hooks/use-viewer";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function TasksPage() {
  const { viewer, isLoading } = useViewer();
  const updatePreferences = useMutation(api.preferences.updateMyPreferences);

  const [currentView, setCurrentView] = useState<"board" | "todayPlusBoard">(
    "board",
  );
  const [selectedTask, setSelectedTask] = useState<
    (typeof mockTasks)[0] | null
  >(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Load saved view preference when viewer data loads
  useEffect(() => {
    const savedView = viewer?.preferences?.taskDefaultView;
    if (savedView && savedView !== currentView) {
      setCurrentView(savedView);
    }
  }, [viewer, currentView]);

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

  const handleTaskClick = (task: (typeof mockTasks)[0]) => {
    setSelectedTask(task);
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
          <BoardView tasks={mockTasks} onTaskClick={handleTaskClick} />
        ) : (
          <TodayBoardView tasks={mockTasks} onTaskClick={handleTaskClick} />
        )}
      </div>

      {/* Task details sheet */}
      <TaskDetailsSheet
        task={selectedTask}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  );
}
