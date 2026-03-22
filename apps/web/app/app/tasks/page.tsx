"use client";

import { TaskFeature } from "@/components/tasks/task-feature";

export default function TasksPage() {
  return (
    <TaskFeature.Provider>
      <TaskFeature.Frame>
        <div className="sticky top-0 z-10 border-b border-border bg-background/95 px-6 py-3 backdrop-blur-sm supports-backdrop-filter:bg-background/90 md:px-8">
          <div className="space-y-2">
            <TaskFeature.Toolbar />
            <TaskFeature.Filters />
          </div>
        </div>
        <TaskFeature.Content />
        <TaskFeature.Sheets />
        <TaskFeature.CreateTagDialog />
      </TaskFeature.Frame>
    </TaskFeature.Provider>
  );
}
