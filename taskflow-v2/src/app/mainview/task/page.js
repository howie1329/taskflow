import { Separator } from "@/components/ui/separator";
import React from "react";
import { GeneralKanbanTaskBoard } from "@/presentation/components/task/GeneralKanbanTaskBoard";

function Page() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-shrink-0 p-4">
        <h1 className="text-xl font-bold">Task Board</h1>
        <Separator />
      </div>
      <div className="flex-1 overflow-hidden">
        <GeneralKanbanTaskBoard />
      </div>
    </div>
  );
}

export default Page;
