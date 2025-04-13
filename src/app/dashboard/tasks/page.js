"use client";
import react, { useEffect, useState } from "react";
import TaskDashboard from "../components/TaskDashboard";
import { TaskTable } from "../components/TaskTable";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CreateTaskModal } from "@/app/features/tasks/components/CreateTaskModal";
import AIDialogChat from "@/app/features/ai/AIDialogChat";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import datas from "@/app/taskData.json";
import useUpload from "@/hooks/useUpload";
import useFetchStats from "@/hooks/useFetchStats";
import { useFilteringTasks } from "@/hooks/useFilteringTasks";
import useGetTasks from "@/hooks/useGetTasks";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SlidersIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@clerk/nextjs";
import { socket } from "@/lib/socket/socketClient";

function Page() {
  const [tableView, setTableView] = useState(false);
  const mutation = useUpload();
  const { userId } = useAuth();
  const { data: stat, isLoading } = useFetchStats();
  const { data: tasks, isLoading: isTaskLoading } = useGetTasks(userId);
  const { setPriorityFilter, setStatus, priorityFilter, status } =
    useFilteringTasks(tasks);

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

  if (!userId || isLoading || isTaskLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex mx-2 flex-col flex-1 gap-2 ">
      <div className="flex w-full justify-between items-center">
        <div className="flex gap-2">
          {statsHeader.map((item, key) => (
            <Card
              className="flex flex-col justify-center items-center w-32 h-fit "
              key={key}
            >
              <p>{stat.data[item]}</p>
              <p>{item}</p>
            </Card>
          ))}
        </div>
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
          <CreateTaskModal />
          <Button onClick={onClick}>Upload JSON</Button>
          <Switch
            checked={tableView}
            onCheckedChange={() => setTableView(!tableView)}
          />
          {tableView ? (
            <Label className="font-semibold">Table View</Label>
          ) : (
            <Label className="font-semibold">Card View</Label>
          )}
        </Card>
      </div>
      <Card>
        {tableView ? (
          <TaskTable />
        ) : (
          <TaskDashboard
            tasksData={tasks}
            status={status}
            priorityFilter={priorityFilter}
            isLoading={isTaskLoading}
          />
        )}
      </Card>
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
