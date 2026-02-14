"use client";

import { TaskFeature } from "@/components/tasks/task-feature";

export function TasksLayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <TaskFeature.Provider>
      <TaskFeature.Frame>
        <div className="sticky top-0 z-10 border-b border-border/50 bg-background/85 px-3 py-2 backdrop-blur supports-backdrop-filter:bg-background/75 md:px-4">
          <div className="space-y-2">
            <TaskFeature.Toolbar />
            <TaskFeature.Filters />
          </div>
        </div>
        <TaskFeature.Content />
        <TaskFeature.Sheets />
        <TaskFeature.CreateTagDialog />
        {children}
      </TaskFeature.Frame>
    </TaskFeature.Provider>
  );
}
