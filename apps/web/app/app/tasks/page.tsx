"use client";

import { TaskFeature } from "@/components/tasks/task-feature";

export default function TasksPage() {
  return (
    <TaskFeature.Provider>
      <TaskFeature.Frame>
        <TaskFeature.Toolbar />
        <TaskFeature.Filters />
        <TaskFeature.Content />
        <TaskFeature.DetailsSheet />
        <TaskFeature.CreateSheet />
        <TaskFeature.CreateTagDialog />
      </TaskFeature.Frame>
    </TaskFeature.Provider>
  );
}
