"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useFetchAllProjectTasks from "@/hooks/projects/useFetchAllProjectTasks";
import useFetchSingleProject from "@/hooks/projects/useFetchSingleProject";
import { GeneralKanbanTaskBoard } from "@/presentation/components/projects/GeneralKanbanTaskBoard";
import { FilterIcon, PlusIcon, SearchIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo } from "react";
import { useProjectUIStore } from "@/presentation/hooks/useProjectUIStore";
import useSocketStore from "@/lib/sockets/SocketStore";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Page() {
  const { id } = useParams();
  const router = useRouter();
  const { data: project } = useFetchSingleProject(id);
  const { data: tasks = [] } = useFetchAllProjectTasks(id);
  const { socket } = useSocketStore();
  const queryClient = useQueryClient();

  const {
    activeSearch,
    searchQuery,
    filteredData,
    filterStatuses,
    getFilteredData,
    setSearchQuery,
    setActiveSearch,
    handleStatusFilterChange,
  } = useProjectUIStore();

  const statusOptions = useMemo(
    () => [
      { id: "notStarted", label: "Not Started" },
      { id: "todo", label: "To Do" },
      { id: "inProgress", label: "In Progress" },
      { id: "done", label: "Done" },
      { id: "overdue", label: "Overdue" },
    ],
    []
  );

  const counts = useMemo(() => {
    const total = tasks.length || 0;
    const by = (key) => tasks.filter((t) => t.status === key).length;
    return {
      total,
      done: by("done"),
      overdue: by("overdue"),
    };
  }, [tasks]);

  useEffect(() => {
    if (socket) {
      socket.on("project-created", () => {
        queryClient.cancelQueries({ queryKey: ["projects"] });
        queryClient.invalidateQueries({ queryKey: ["projects"] });
      });
      socket.on("project-updated", () => {
        queryClient.cancelQueries({ queryKey: ["projects"] });
        queryClient.invalidateQueries({ queryKey: ["projects"] });
      });
      socket.on("project-deleted", () => {
        queryClient.cancelQueries({ queryKey: ["projects"] });
        queryClient.invalidateQueries({ queryKey: ["projects"] });
      });
    }
    getFilteredData(tasks);
  }, [
    searchQuery,
    tasks,
    activeSearch,
    filterStatuses,
    getFilteredData,
    socket,
    queryClient,
  ]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden h-full p-2 rounded-tr-md rounded-br-md bg-white">
      <div className="flex flex-col gap-2 mb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-base font-semibold truncate">
              {project?.title ?? "Project"}
            </h1>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project?.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <SearchIcon className="size-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                placeholder="Search tasks"
                className="w-[240px]"
                onChange={(e) => {
                  const v = e.target.value;
                  setSearchQuery(v);
                  setActiveSearch(!!v.trim());
                }}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <FilterIcon />
                  Filters
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent sideOffset={6}>
                <DropdownMenuLabel>Statuses</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {statusOptions.map((opt) => (
                  <DropdownMenuCheckboxItem
                    key={opt.id}
                    checked={
                      filterStatuses.includes("all")
                        ? false
                        : filterStatuses.includes(opt.id)
                    }
                    onCheckedChange={() => handleStatusFilterChange(opt.id)}
                  >
                    {opt.label}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={filterStatuses.includes("all")}
                  onCheckedChange={() => handleStatusFilterChange("all")}
                >
                  All
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={() =>
                router.push(
                  `/mainview/projects/${id}/notes/${Math.random()
                    .toString(36)
                    .substring(2, 15)}`
                )
              }
              variant="outline"
              size="icon"
            >
              <PlusIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          {counts.total} tasks · {counts.done} done · {counts.overdue} overdue
        </div>
      </div>

      <Separator />

      <div className="flex-1 overflow-hidden h-full ">
        <GeneralKanbanTaskBoard data={filteredData} />
      </div>
    </div>
  );
}
