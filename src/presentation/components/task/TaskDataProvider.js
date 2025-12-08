"use client";
import { createContext, useContext } from "react";
import useRealTimeTask from "@/hooks/tasks/useRealTimeTask";

const TaskDataContext = createContext(null);

export const TaskDataProvider = ({ children }) => {
  const { isLoading, error, tasks: realTimeTasks } = useRealTimeTask();

  return (
    <TaskDataContext.Provider value={{ tasks: realTimeTasks || [], isLoading, error }}>
      {children}
    </TaskDataContext.Provider>
  );
};

export const useTaskData = () => {
  const context = useContext(TaskDataContext);
  if (!context) {
    throw new Error("useTaskData must be used within TaskDataProvider");
  }
  return context;
};
