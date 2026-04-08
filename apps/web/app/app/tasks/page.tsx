"use client";

import { TaskFeature } from "@/components/tasks/task-feature";

export default function TasksPage() {
  return (
    <TaskFeature.Provider>
      <TaskFeature.Frame>
        <TaskFeature.Toolbar />
        <TaskFeature.Content />
        <TaskFeature.Sheets />
        <TaskFeature.CreateTagDialog />
      </TaskFeature.Frame>
    </TaskFeature.Provider>
  );
}
