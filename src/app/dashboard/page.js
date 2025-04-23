"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { QuickNotes } from "./components/QuickNotes";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { TaskCreateDialog } from "@/features/tasks/TaskCreateDialog";
const Page = () => {
  const [filter, setFilter] = useState("None");
  const { getToken } = useAuth();
  const onClick = async () => {
    const token = await getToken();
    axios
      .get(
        "https://taskflow-backend-production-8812.up.railway.app/api/tasks/user",
        { headers: { Authorization: token }, withCredentials: true }
      )
      .then((res) => {
        console.log(res);
      });
  };
  return (
    <div className="m-2 h-full w-full ">
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard</p>
      <Button onClick={onClick}>Check</Button>
      <Separator />
      <div className="flex flex-row mt-5 space-x-2">
        <Card className="flex flex-col w-[600px] h-[450px]  items-center">
          <Select onValueChange={setFilter} defaultValue="None">
            <div className="flex items-center justify-center space-x-2  my-2">
              <CardHeader>
                <h2>Todays Task</h2>
              </CardHeader>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <TaskCreateDialog small={true} />
            </div>
            <Separator />
            <SelectContent>
              <SelectItem value="None">None</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
          <CardContent className="flex flex-col gap-2 overflow-scroll items-center my-1">
            <p>No Tasks</p>
          </CardContent>
        </Card>

        <div className="flex flex-col w-full gap-2">
          <div className="border-2 border-red-600 w-full h-[250px]">
            Calander
          </div>
          <Card className="flex w-[400px] h-[325px]">
            <QuickNotes />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Page;
