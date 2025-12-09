"use client";
import { createContext, useContext, useMemo } from "react";
import useRealTimeTask from "@/hooks/tasks/useRealTimeTask";
import { useTaskUIStore } from "@/presentation/hooks/useTaskUIStore";

const TaskDataContext = createContext(null);

/**
 * TaskDataProvider - Provides both raw and filtered task data
 * 
 * This component handles:
 * - Data fetching (via useRealTimeTask)
 * - Data filtering (based on UI state from Zustand)
 * 
 * Why filtering is here:
 * - Filtering is a data transformation concern, not UI rendering
 * - Provides "ready-to-use" filtered data to consumers
 * - Centralizes data logic in one place
 * - Components don't need to know about filtering implementation
 */
export const TaskDataProvider = ({ children }) => {
  const { isLoading, error, tasks: realTimeTasks } = useRealTimeTask();
  
  // Get filter state from Zustand store
  const {
    activeSearch,
    searchQuery,
    filterStatuses,
    getFilteredData,
  } = useTaskUIStore();

  // Compute filtered data inside the provider
  const filteredTasks = useMemo(() => {
    if (!realTimeTasks || realTimeTasks.length === 0) return [];
    return getFilteredData(realTimeTasks);
  }, [realTimeTasks, searchQuery, activeSearch, filterStatuses, getFilteredData]);

  const value = useMemo(() => ({
    // Raw data (for cases where you need unfiltered data)
    tasks: realTimeTasks || [],
    // Filtered data (most common use case)
    filteredTasks,
    isLoading,
    error,
  }), [realTimeTasks, filteredTasks, isLoading, error]);

  return (
    <TaskDataContext.Provider value={value}>
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
