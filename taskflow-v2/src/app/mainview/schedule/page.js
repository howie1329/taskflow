"use client";
import { Separator } from "@/components/ui/separator";
import React, { useState } from "react";
import { testTaskData } from "../../../../docs/testData/testTaskData";

function Page() {
  const data = testTaskData;

  const baseColumns = [
    {
      id: "brainDump",
      title: "Brain Dump",
      tasks: [],
    },
    {
      id: "today",
      title: "Today",
      tasks: [],
    },
    {
      id: "tomorrow",
      title: "Tomorrow",
      tasks: [],
    },
    {
      id: "dayAfterTomorrow",
      title: "Day After Tomorrow",
      tasks: [],
    },
    {
      id: "nextDay",
      title: "Next Day",
      tasks: [],
    },
  ];

  const [activeColumn, setActiveColumn] = useState(baseColumns);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-shrink-0 p-1 flex flex-row justify-between items-center gap-1">
        <h1 className="text-lg font-bold ">Schedule</h1>
      </div>
      <Separator />
      <div className="grid grid-cols-5 flex-1 bg-[#fafafa] gap-2 border-black border-2">
        {activeColumn.map((column) => (
          <div
            key={column.id}
            className="col-span-1 bg-white border-black border-2 rounded-lg p-1"
          >
            <h2 className="text-sm font-semibold text-center">
              {column.title}
            </h2>
            <Separator />
            <div className="p-2 min-h-[200px]">
              {/* Task content will go here */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Page;
