"use client";
import { createContext, useContext, useMemo } from "react";
import useRealTimeTask from "@/hooks/tasks/useRealTimeTask";
import { useTaskFilters } from "./TaskFilterContext";
import { filterTasks } from "./utils/taskFilters";

const TaskDataContext = createContext(null);

/**
 * TaskDataProvider - Provides both raw and filtered task data
 * 
 * This component handles:
 * - Data fetching (via useRealTimeTask)
 * - Data filtering (based on filter state from TaskFilterContext)
 * 
 * Why filtering is here:
 * - Filtering is a data transformation concern, not UI rendering
 * - Provides "ready-to-use" filtered data to consumers
 * - Centralizes data logic in one place
 * - Components don't need to know about filtering implementation
 */
export const TaskDataProvider = ({ children }) => {
  const { isLoading, error, tasks: realTimeTasks } = useRealTimeTask();
  
  // Get filter state from TaskFilterContext (replaces Zustand)
  const {
    activeSearch,
    searchQuery,
    filterStatuses,
  } = useTaskFilters();

  // Compute filtered data using pure function
  const filteredTasks = useMemo(() => {
    return filterTasks(realTimeTasks || [], {
      filterStatuses,
      searchQuery,
      activeSearch,
    });
  }, [realTimeTasks, searchQuery, activeSearch, filterStatuses]);

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
