"use client";
import { createContext, useContext } from "react";
import { useState } from "react";

const TaskFilterContext = createContext();

export const TaskFilterProvider = ({ children }) => {
  const [isSearchBarOpen, setIsSearchBarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatuses, setFilterStatuses] = useState(["all"]);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleStatusFilterChange = (status) => {
    if (status === "all") {
      setFilterStatuses(["all"]);
      return;
    }
    const newStatuses = filterStatuses.includes("all")
      ? [status]
      : filterStatuses.includes(status)
      ? filterStatuses.filter((s) => s !== status)
      : [...filterStatuses, status];

    if (newStatuses.length === 0) {
      setFilterStatuses(["all"]);
      return;
    }
    setFilterStatuses(newStatuses);
  };

  const values = {
    isSearchBarOpen,
    setIsSearchBarOpen,
    searchQuery,
    setSearchQuery,
    filterStatuses,
    setFilterStatuses,
    isCreateTaskOpen,
    setIsCreateTaskOpen,
    handleStatusFilterChange,
    isFilterOpen,
    setIsFilterOpen,
  };

  return (
    <TaskFilterContext.Provider value={values}>
      {children}
    </TaskFilterContext.Provider>
  );
};

export const useTaskFilter = () => {
  const context = useContext(TaskFilterContext);
  if (!context) {
    throw new Error("useTaskFilter must be used within a TaskFilterProvider");
  }
  return context;
};
