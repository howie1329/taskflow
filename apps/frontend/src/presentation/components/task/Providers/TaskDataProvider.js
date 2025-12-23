"use client";
import { createContext, useContext, useMemo } from "react";
import useRealTimeTask from "@/hooks/tasks/useRealTimeTask";
import { useTaskFilter } from "./TaskFilterProvider";

// Context to provide the task data to the children
const TaskDataContext = createContext();

// Provider component to provide the task data to the children
export const TaskDataProvider = ({ children }) => {
  const { tasks, isLoading, error } = useRealTimeTask();
  const { filterStatuses, searchQuery } = useTaskFilter();

  const filteredTasks = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];
    const searchedTasks = tasks.filter((task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filterStatuses.includes("all")) return searchedTasks; // if all statuses are selected, return all tasks
    return searchedTasks.filter((task) => filterStatuses.includes(task.status));
  }, [tasks, filterStatuses, searchQuery]);
  return (
    <TaskDataContext.Provider value={{ filteredTasks, isLoading, error }}>
      {children}
    </TaskDataContext.Provider>
  );
};

// Custom hook to access the task data
export const useTaskData = () => {
  const context = useContext(TaskDataContext);
  if (!context) {
    throw new Error("useTaskData must be used within a TaskDataProvider");
  }
  return context;
};
