"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useFetchAllProjectTasks from "@/hooks/projects/useFetchAllProjectTasks";
import useFetchSingleProject from "@/hooks/projects/useFetchSingleProject";
import { GeneralKanbanTaskBoard } from "@/presentation/components/projects/GeneralKanbanTaskBoard";
import { PlusIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useProjectUIStore } from "@/presentation/hooks/useProjectUIStore";
export default function Page() {
  const { id } = useParams();
  const router = useRouter();
  const { data: project } = useFetchSingleProject(id);
  const { data: tasks } = useFetchAllProjectTasks(id);
  const {
    activeSearch,
    searchQuery,
    filteredData,
    filterStatuses,
    getFilteredData,
  } = useProjectUIStore();
  useEffect(() => {
    getFilteredData(tasks);
  }, [searchQuery, tasks, activeSearch, filterStatuses, getFilteredData]);
  return (
    <div className="flex flex-col flex-1 overflow-hidden h-full p-2 rounded-tr-md rounded-br-md bg-white">
      <div className="flex flex-col justify-between items-center">
        <div className="flex flex-row justify-between items-center w-full p-2">
          <div className="flex flex-col">
            <p className="text-sm text-gray-500">{project?.description}</p>
          </div>

          <Button
            onClick={() =>
              router.push(
                `/mainview/projects/${id}/notes/${Math.random()
                  .toString(36)
                  .substring(2, 15)}`
              )
            }
            variant="outline"
            className="p-1 h-6 w-6 rounded-full"
          >
            <PlusIcon className="w-2 h-2" />
          </Button>
        </div>
        <Separator />
      </div>

      <div className="flex-1 overflow-hidden h-full ">
        <GeneralKanbanTaskBoard data={filteredData} />
      </div>
    </div>
  );
}
