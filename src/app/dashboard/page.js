"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFetchFilterTask } from "@/hooks/useFetchFilterTask";
import React, { useState } from "react";
import { TaskModal } from "../features/tasks/components/TaskModal";
import { Separator } from "@/components/ui/separator";

const Page = () => {
  const [filter, setFilter] = useState("None");
  const { data: filteredTask, isLoading, isError } = useFetchFilterTask(filter);
  return (
    <div className="m-2 h-full w-full ">
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard</p>
      <Separator />
      <div className="flex flex-row mt-5 space-x-2">
        <Card className="flex flex-col w-[600px] h-[450px]  items-center">
          <CardHeader>Task Filter</CardHeader>
          <Select onValueChange={setFilter} defaultValue="None">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="None">None</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
          <CardContent className="flex flex-col gap-2 overflow-scroll items-center my-1">
            {isLoading ? (
              <p>Loading Task...</p>
            ) : (
              filteredTask.map((task) => (
                <TaskModal className="mx-0" key={task.id} task={task} />
              ))
            )}
            {filter === "None" ? <p>Select A Filter To Start</p> : ""}
          </CardContent>
        </Card>

        <div className="flex flex-col w-full gap-2">
          <div className="border-2 border-red-600 w-full h-[250px]">
            Calander
          </div>
          <div className="border-2 border-blue-500 w-[475px] h-[325px]">
            Quick Notes
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
