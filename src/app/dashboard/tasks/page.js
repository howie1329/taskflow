"use client";
import react, { useState } from "react";
import TaskDashboard from "../components/TaskDashboard";
import { TaskTable } from "../components/TaskTable";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CreateTaskModal } from "@/app/features/tasks/components/CreateTaskModal";
import AIDialogChat from "@/app/features/ai/AIDialogChat";
import { Card } from "@/components/ui/card";

function Page() {
  const [tableView, setTableView] = useState(false);

  return (
    <div className="flex mx-2 flex-col flex-1 gap-2 ">
      <div className="flex w-full justify-between">
        <Card className="flex justify-between items-center h-16 px-2 ">
          23 Task
        </Card>
        <Card className="flex justify-between items-center w-96 h-16 px-2 ">
          <AIDialogChat />
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
        </Card>
      </div>
      <Card>{tableView ? <TaskTable /> : <TaskDashboard />}</Card>
    </div>
  );
}

export default Page;
