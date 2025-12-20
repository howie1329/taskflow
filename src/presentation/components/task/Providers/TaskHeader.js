"use client";

import { Card } from "@/components/ui/card";
import { useTaskFilter } from "./TaskFilterProvider";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlusSignIcon,
  Search02Icon,
  FilterIcon,
} from "@hugeicons/core-free-icons/index";
import { FilterDropdownCard } from "../FilterDropDownCard";
import { CreateTaskDialog } from "../CreateTaskDialog";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const TaskHeader = () => {
  const {
    isSearchBarOpen,
    setIsSearchBarOpen,
    searchQuery,
    setSearchQuery,
    filterStatuses,
    handleStatusFilterChange,
    isFilterOpen,
    setIsFilterOpen,
    setIsCreateTaskOpen,
    isCreateTaskOpen,
  } = useTaskFilter();
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-row justify-between items-center gap-1">
        <SidebarTrigger className="lg:hidden" />
        <h1 className="text-lg font-bold text-ellipsis line-clamp-1 ">
          Task Board
        </h1>
        <AnimatePresence>
          {isSearchBarOpen && (
            <motion.Input
              key="search-bar"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex-1 p-2 rounded-md h-8 bg-card border text-sm text-center"
              placeholder="Search tasks"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          )}
        </AnimatePresence>
        <Card className="flex flex-row justify-between items-center p-1 gap-1 rounded-none relative shadow-none">
          <Button
            variant="outline"
            className="p-1 h-6 w-6 rounded-full"
            onClick={() => setIsCreateTaskOpen(!isCreateTaskOpen)}
          >
            <HugeiconsIcon icon={PlusSignIcon} size={20} strokeWidth={2} />
          </Button>
          <Button
            variant="outline"
            className={`p-1 h-6 w-6 rounded-full ${
              isSearchBarOpen ? "bg-accent" : ""
            }`}
            onClick={() => setIsSearchBarOpen(!isSearchBarOpen)}
          >
            <HugeiconsIcon icon={Search02Icon} size={20} strokeWidth={2} />
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
            <HugeiconsIcon icon={FilterIcon} size={20} strokeWidth={2} />
          </Button>

          {/* Filter Dropdown */}
          {isFilterOpen && (
            <FilterDropdownCard
              filterStatuses={filterStatuses}
              onFilterChange={handleStatusFilterChange}
            />
          )}
        </Card>

        <CreateTaskDialog
          isOpen={isCreateTaskOpen}
          onOpenChange={setIsCreateTaskOpen}
        />
      </div>
      <Separator />
    </div>
  );
};
