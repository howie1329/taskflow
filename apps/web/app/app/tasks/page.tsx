"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BoardView } from "@/components/tasks/board-view";
import { TodayBoardView } from "@/components/tasks/today-board-view";
import { TaskDetailsSheet } from "@/components/tasks/task-details-sheet";
import { mockTasks } from "@/components/tasks/mock-data";

export default function TasksPage() {
  const [currentView, setCurrentView] = useState<"board" | "todayPlusBoard">(
    "board",
  );
  const [selectedTask, setSelectedTask] = useState<
    (typeof mockTasks)[0] | null
  >(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleTaskClick = (task: (typeof mockTasks)[0]) => {
    setSelectedTask(task);
    setIsDetailsOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header with view switcher */}
      <div className="flex items-center justify-between shrink-0">
        <p className="text-sm text-muted-foreground">
          Organize and track your work
        </p>
        <Tabs
          value={currentView}
          onValueChange={(v) => setCurrentView(v as "board" | "todayPlusBoard")}
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
