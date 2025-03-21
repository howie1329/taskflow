"use client";
import react, { useState } from "react";
import TaskDashboard from "./components/TaskDashboard";
import { TaskTable } from "./components/TaskTable";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CreateTaskModal } from "../features/tasks/components/CreateTaskModal";
import { Button } from "@/components/ui/button";
import axios from "axios";

function Page() {
  const [tableView, setTableView] = useState(false);

  const askAI = () => {
    console.log("Ask AI");
    const prompt =
      "Create subtasks for the task of creating a simple todo react native and add any notes you think might be helpful.";
    const data = { prompt: prompt };
    axios.post("/api/ai", data).then((res) => {
      console.log(res);
    });
  };

  return (
    <div className="flex m-2 flex-col items-center flex-1">
      <div className="flex justify-evenly items-center w-full">
        <h1 className="font-bold text-2xl text-center ">
          Task Flow - Dashboard
        </h1>
        <Button onClick={askAI}>Ask AI!</Button>
        <div className="flex justify-center items-center gap-2">
          <CreateTaskModal />
          <Switch
            checked={tableView}
            onCheckedChange={() => setTableView(!tableView)}
          />
          {tableView ? (
            <Label className="font-semibold">Table View</Label>
          ) : (
            <Label className="font-semibold">Card View</Label>
          )}
        </div>
      </div>

      {tableView ? <TaskTable /> : <TaskDashboard />}
    </div>
  );
}

export default Page;
