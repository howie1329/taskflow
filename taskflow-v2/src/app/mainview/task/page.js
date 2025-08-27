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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function Page() {
  const data = testTaskData;
  const [activeSearch, setActiveSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(data);
  const [filterStatuses, setFilterStatuses] = useState(["all"]);
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

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
      {/* Create Task Dialog - Modal */}
      <CreateTaskDialog
        isOpen={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
      />
    </div>
  );
}

export default Page;

const CreateTaskDialog = ({ isOpen, onOpenChange }) => {
  const [status, setStatus] = useState("notStarted");
  const [priority, setPriority] = useState("low");
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <Separator />
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2 gap-2 flex flex-col">
            <Input placeholder="Task Title" />
            <Textarea placeholder="Task Description" />
            <Input
              className="col-span-1"
              type="date"
              placeholder="Task Due Date"
            />
            <TaskFormStatusDropdown status={status} setStatus={setStatus} />
          </div>

          <div className="col-span-1 gap-2 flex flex-col">
            <TaskFormPriorityDropdown
              priority={priority}
              setPriority={setPriority}
            />

            <Input placeholder="Task Assignee" />
            <Input placeholder="Task Labels" />
          </div>
          <div className="col-span-3 ">
            <Button className="w-full">Create Task</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const TaskFormPriorityDropdown = ({ priority, setPriority }) => {
  const getPriorityLabel = (priority) => {
    switch (priority) {
      case "low":
        return "Low";
      case "medium":
        return "Medium";
      case "high":
        return "High";
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <p className="border border-input bg-background hover:bg-accent hover:text-accent-foreground py-1 text-sm font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
          {getPriorityLabel(priority)}
        </p>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => setPriority("low")}>
          Low
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setPriority("medium")}>
          Medium
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setPriority("high")}>
          High
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const TaskFormStatusDropdown = ({ status, setStatus }) => {
  const getStatusLabel = (status) => {
    switch (status) {
      case "notStarted":
        return "Not Started";
      case "inProgress":
        return "In Progress";
      case "overdue":
        return "Overdue";
      case "completed":
        return "Completed";
      default:
        return "Not Started";
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full">
        <p className="border border-input bg-background hover:bg-accent hover:text-accent-foreground py-1 text-sm font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
          {getStatusLabel(status)}
        </p>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => setStatus("notStarted")}>
          Not Started
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setStatus("inProgress")}>
          In Progress
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setStatus("overdue")}>
          Overdue
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setStatus("completed")}>
          Completed
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

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
