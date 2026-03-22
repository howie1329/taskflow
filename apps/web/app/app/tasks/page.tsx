"use client";

import { TaskFeature } from "@/components/tasks/task-feature";

export default function TasksPage() {
  return (
    <TaskFeature.Provider>
      <TaskFeature.Frame>
        <div className="sticky top-0 z-20 border-b border-border/70 bg-background/94 px-6 py-3 backdrop-blur supports-backdrop-filter:bg-background/88 md:px-8">
          <div className="flex flex-col gap-2.5">
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
