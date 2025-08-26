import { Separator } from "@/components/ui/separator";
import React from "react";
import { GeneralKanbanTaskBoard } from "@/presentation/components/task/GeneralKanbanTaskBoard";
import { testTaskData } from "../../../../docs/testData/testTaskData";
import { Button } from "@/components/ui/button";
import { PlusIcon, SearchIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FilterIcon } from "lucide-react";

function Page() {
  const data = testTaskData;
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-shrink-0 p-1 flex flex-row justify-between items-center">
        <h1 className="text-xl font-bold">Task Board</h1>
        <Card className="flex flex-row justify-between items-center p-1 gap-1 rounded-sm">
          <Button variant="outline" className="p-1 h-6 w-6 rounded-full">
            <PlusIcon className="w-2 h-2" />
          </Button>
          <Button variant="outline" className="p-1 h-6 w-6 rounded-full">
            <SearchIcon className="w-2 h-2" />
          </Button>
          <Button variant="outline" className="p-1 h-6 w-6 rounded-full">
            <FilterIcon className="w-2 h-2" />
          </Button>
        </Card>
      </div>
      <Separator />
      <div className="flex-1 overflow-hidden">
        <GeneralKanbanTaskBoard data={data} />
      </div>
    </div>
  );
}

export default Page;
