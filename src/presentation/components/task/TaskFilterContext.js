"use client";
import { createContext, useContext, useState, useCallback } from "react";

const TaskFilterContext = createContext(null);

/**
 * TaskFilterProvider - Manages filter state via React Context
 * 
 * This replaces Zustand for filter state management.
 * Uses React Context + useState for simpler, more React-native approach.
 */
export const TaskFilterProvider = ({ children }) => {
  // UI State
  const [activeSearch, setActiveSearch] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  
  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatuses, setFilterStatuses] = useState(["all"]);

  // Handler for status filter changes
  const handleStatusFilterChange = useCallback((status) => {
    setFilterStatuses((current) => {
      if (status === "all") {
        return ["all"];
      }
      
      if (current.includes("all")) {
        return [status];
      }
      
      if (current.includes(status)) {
        const newStatuses = current.filter((s) => s !== status);
        return newStatuses.length === 0 ? ["all"] : newStatuses;
      }
      
      return [...current, status];
    });
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilterStatuses(["all"]);
    setSearchQuery("");
    setActiveSearch(false);
  }, []);

  const value = {
    // UI State
    activeSearch,
    isFilterOpen,
    isCreateTaskOpen,
    
    // Filter State
    searchQuery,
    filterStatuses,
    
    // Actions
    setActiveSearch,
    setSearchQuery,
    setIsFilterOpen,
    setIsCreateTaskOpen,
    handleStatusFilterChange,
    resetFilters,
  };

  return (
    <TaskFilterContext.Provider value={value}>
      {children}
    </TaskFilterContext.Provider>
  );
};

export const useTaskFilters = () => {
  const context = useContext(TaskFilterContext);
  if (!context) {
    throw new Error("useTaskFilters must be used within TaskFilterProvider");
  }
  return context;
};
