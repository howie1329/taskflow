"use client";
import { useState } from "react";

import { TaskTable } from "../components/TaskTable";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import AIDialogChat from "@/features/Ai/AIDialogChat";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import datas from "@/app/taskData.json";
import useTaskCreate from "@/features/tasks/hooks/useTaskCreate";
import { useFilteringTasks } from "@/features/tasks/hooks/useFilteringTasks";
import useGetTasks from "@/features/tasks/hooks/useGetTasks";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SlidersIcon, LayoutGrid, Table } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@clerk/nextjs";
import { getSocket } from "@/lib/socket/socketClient";
import TaskDashboard from "@/features/tasks/components/TaskDashboard";
import { TaskCreateDialog } from "@/features/tasks/TaskCreateDialog";
import TaskBoardView from "@/features/tasks/components/TaskBoardView";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

function Page() {
  const [view, setView] = useState("card");
  const mutation = useTaskCreate();
  const { userId } = useAuth();
  const { data: tasks, isLoading: isTaskLoading } = useGetTasks(userId);
  const { setPriorityFilter, setStatus, priorityFilter, status } =
    useFilteringTasks(tasks);
  const socket = getSocket();

  const onClick = () => {
    socket.emit("task-created");
    {
      /*
      datas.map((data) => {
        mutation.mutate(data);
      });
    */
    }
  };

  const statsHeader = ["Total", "Completed", "Overdue"];

  /// TODO: STATS NEED TO BE CACHED IN REDIS ///

  if (!userId || isTaskLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex mx-2 flex-col flex-1 gap-2 ">
      <div className="flex w-full justify-between items-center">
        <Card className="w-fit h-fit p-2 bg-primary hover:bg-primary/90 shadow hover:cursor-pointer">
          <CollapsibleFilter
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            setStatusFilter={setStatus}
            statusFilter={status}
          />
        </Card>

        <Card className="flex justify-between items-center h-16 px-2 space-x-2">
          <AIDialogChat />
          <TaskCreateDialog />
          <Button onClick={onClick}>Upload JSON</Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                {view === "table" ? (
                  <Table className="h-4 w-4" />
                ) : (
                  <LayoutGrid className="h-4 w-4" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <RadioGroup
                defaultValue="card"
                value={view}
                onValueChange={setView}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card">Card View</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="table" id="table" />
                  <Label htmlFor="table">Table View</Label>
                </div>
              </RadioGroup>
            </PopoverContent>
          </Popover>
        </Card>
      </div>
      <div>
        {view === "table" ? (
          <TaskTable />
        ) : (
          //<TaskBoardView />
          <TaskDashboard
            tasksData={tasks}
            status={status}
            priorityFilter={priorityFilter}
            isLoading={isTaskLoading}
          />
        )}
      </div>
    </div>
  );
}

const CollapsibleFilter = ({
  priorityFilter,
  setPriorityFilter,
  setStatusFilter,
  statusFilter,
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <SlidersIcon color="#ffffff" />
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col space-y-2">
          <div className="flex flex-row items-center justify-center space-x-1">
            <Label>Priority</Label>
            <Select
              defaultValue={priorityFilter}
              onValueChange={setPriorityFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-row items-center justify-center space-x-1">
            <Label>Status</Label>
            <Select defaultValue={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={false}>Not Complete</SelectItem>
                <SelectItem value={true}>Complete</SelectItem>
                <SelectItem value={null}>All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Page;
