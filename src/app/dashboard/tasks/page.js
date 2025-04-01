"use client";
import react, { useState } from "react";
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

function Page() {
  const [tableView, setTableView] = useState(false);
  const mutation = useUpload();
  const { data: stat, isLoading, isError } = useFetchStats();

  const onClick = () => {
    datas.map((data) => {
      mutation.mutate(data);
    });
  };

  const statsHeader = ["Total", "Completed", "Overdue"];

  return (
    <div className="flex mx-2 flex-col flex-1 gap-2 ">
      <div className="flex w-full justify-between items-center">
        <div className="flex gap-2">
          {isLoading == false &&
            statsHeader.map((item, key) => (
              <Card
                className="flex flex-col justify-center items-center w-32 h-fit "
                key={key}
              >
                <p>{stat.data[item]}</p>
                <p>{item}</p>
              </Card>
            ))}
        </div>

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
      <Card>{tableView ? <TaskTable /> : <TaskDashboard />}</Card>
    </div>
  );
}

export default Page;
