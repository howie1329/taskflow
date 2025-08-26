"use client";
import { Separator } from "@/components/ui/separator";
import React, { useEffect, useState } from "react";
import { GeneralKanbanTaskBoard } from "@/presentation/components/task/GeneralKanbanTaskBoard";
import { testTaskData } from "../../../../docs/testData/testTaskData";
import { Button } from "@/components/ui/button";
import { Check, PlusIcon, SearchIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FilterIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

function Page() {
  const data = testTaskData;
  const [activeSearch, setActiveSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(data);
  const [filterStatuses, setFilterStatuses] = useState(["all"]);
  const [isFilterOpen, setFilterOpen] = useState(false);

  // Updated filtering logic for multiple statuses
  useEffect(() => {
    let filtered = data;

    // Apply status filters (multiple selection)
    if (!filterStatuses.includes("all")) {
      filtered = filtered.filter((task) =>
        filterStatuses.includes(task.status)
      );
    }

    // Then apply search filter if active
    if (activeSearch && searchQuery.trim()) {
      filtered = filtered.filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredData(filtered);
  }, [searchQuery, data, activeSearch, filterStatuses]);

  // Alternative approach - simpler logic
  const handleStatusFilterChange = (status) => {
    if (status === "all") {
      setFilterStatuses(["all"]);
      return;
    }

    setFilterStatuses((prev) => {
      // If "all" is selected, replace with just this status
      if (prev.includes("all")) {
        return [status];
      }

      // If this status is already selected, remove it
      if (prev.includes(status)) {
        const remaining = prev.filter((s) => s !== status);
        // If nothing left, go back to "all"
        return remaining.length === 0 ? ["all"] : remaining;
      }

      // Otherwise, add this status to the existing selection
      return [...prev, status];
    });
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
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
          <Button variant="outline" className="p-1 h-6 w-6 rounded-full">
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
            onClick={() => setFilterOpen(!isFilterOpen)}
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
    </div>
  );
}

export default Page;

const FilterDropdownCard = ({ filterStatuses, onFilterChange }) => {
  const filterOptions = [
    {
      label: "All",
      value: "all",
    },
    {
      label: "Not Started",
      value: "notStarted",
    },
    {
      label: "In Progress",
      value: "inProgress",
    },
    {
      label: "Overdue",
      value: "overdue",
    },
    {
      label: "Completed",
      value: "completed",
    },
  ];

  return (
    <Card className="absolute top-full right-0 mt-1 z-70 w-30 p-3 shadow-2xl border bg-[#fafafa]">
      <div className="flex flex-col gap-2">
        {filterOptions.map((option) => (
          <div
            key={option.value}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <Checkbox
              checked={filterStatuses.includes(option.value)}
              onCheckedChange={() => onFilterChange(option.value)}
            />
            <Label className="cursor-pointer text-xs font-medium">
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    </Card>
  );
};
