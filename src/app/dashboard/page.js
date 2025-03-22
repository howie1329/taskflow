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
    <div className="m-2 border-2 border-black">
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard</p>
      <Separator />
      <Card className="flex flex-col w-[350px] h-[500px] mt-5 items-center">
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
    </div>
  );
};

export default Page;
