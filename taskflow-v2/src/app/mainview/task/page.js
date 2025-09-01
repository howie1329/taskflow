"use client";
import { Separator } from "@/components/ui/separator";
import React, { useEffect } from "react";
import { GeneralKanbanTaskBoard } from "@/presentation/components/task/GeneralKanbanTaskBoard";
import { testTaskData } from "../../../../docs/testData/testTaskData";
import { Button } from "@/components/ui/button";
import { PlusIcon, SearchIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FilterIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

import { CreateTaskDialog } from "@/presentation/components/task/CreateTaskDialog";
import { FilterDropdownCard } from "@/presentation/components/task/FilterDropDownCard";
import { useTaskUIStore } from "@/presentation/hooks/useTaskUIStore";
function Page() {
  const data = testTaskData;
  const {
    activeSearch,
    searchQuery,
    filteredData,
    filterStatuses,
    isFilterOpen,
    isCreateTaskOpen,
    setActiveSearch,
    setSearchQuery,
    setIsFilterOpen,
    setIsCreateTaskOpen,
    handleStatusFilterChange,
    getFilteredData,
  } = useTaskUIStore();

  useEffect(() => {
    getFilteredData(data);
  }, [searchQuery, data, activeSearch, filterStatuses, getFilteredData]);

  return (
    <div className="flex flex-col overflow-hidden h-[93vh]">
      <div className="flex-shrink-0 p-1 flex flex-row justify-between items-center gap-1">
        <h1 className="text-lg font-bold ">Task Board</h1>
        {activeSearch && (
          <Input
            className="flex-1 p-2 rounded-sm h-8"
            placeholder="Search tasks"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        )}
        <Card className="flex flex-row justify-between items-center p-1 gap-1 rounded-sm relative">
          <Button
            variant="outline"
            className="p-1 h-6 w-6 rounded-full"
            onClick={() => setIsCreateTaskOpen(true)}
          >
            <PlusIcon className="w-2 h-2" />
          </Button>
          <Button
            variant="outline"
            className={`p-1 h-6 w-6 rounded-full ${
              activeSearch ? "bg-accent" : ""
            }`}
            onClick={() => setActiveSearch(!activeSearch)}
          >
            <SearchIcon className="w-2 h-2" />
          </Button>
          <Button
            variant="outline"
            className={`p-1 h-6 w-6 rounded-full ${
              filterStatuses.length > 1 || !filterStatuses.includes("all")
                ? "bg-accent"
                : ""
            }`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <FilterIcon className="w-2 h-2" />
          </Button>

          {/* Filter Dropdown */}
          {isFilterOpen && (
            <FilterDropdownCard
              filterStatuses={filterStatuses}
              onFilterChange={handleStatusFilterChange}
            />
          )}
        </Card>
      </div>
      <Separator />
      <div className="flex-1 overflow-hidden">
        <GeneralKanbanTaskBoard data={filteredData} />
      </div>
      {/* Create Task Dialog - Modal */}
      <CreateTaskDialog
        isOpen={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
      />
    </div>
  );
}

export default Page;
