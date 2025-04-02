import React from "react";

export const filterTasks = (tasks, { status, priorityFilter }) => {
  return tasks
    ?.filter((task) => status === null || task.isCompleted === status)
    .filter(
      (task) => priorityFilter === "None" || task.priority === priorityFilter
    );
};
