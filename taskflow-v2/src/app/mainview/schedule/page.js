"use client";
import { Separator } from "@/components/ui/separator";
import React, { useEffect, useState } from "react";
import { testTaskData } from "../../../../docs/testData/testTaskData";
import { Button } from "@/components/ui/button";
import {
  EyeIcon,
  EyeOffIcon,
  MinusIcon,
  PlusIcon,
  TimerResetIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { TaskCard } from "@/presentation/components/task/TaskCard";

const updateColumns = (newButtonIndex, showBrainDump) => {
  const data = testTaskData;
  const columns = [];
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + newButtonIndex);

  const columnCount = showBrainDump ? 4 : 5;

  for (let i = 0; i < columnCount; i++) {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() + i);
    const day = date.toISOString().split("T")[0];
    const dayString = date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    console.log(dayString);
    columns.push({
      id: day,
      title: dayString,
      tasks: [],
    });
  }
  return columns;
};

function Page() {
  const data = testTaskData;
  const [showBrainDump, setShowBrainDump] = useState(true);
  const [buttonIndex, setButtonIndex] = useState(0);
  const [activeColumn, setActiveColumn] = useState([]);

  useEffect(() => {
    const newColumns = updateColumns(buttonIndex, showBrainDump);
    setActiveColumn(newColumns);
  }, [buttonIndex, showBrainDump]);

  const toggleBrainDump = () => {
    setShowBrainDump(!showBrainDump);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-shrink-0 p-1 flex flex-row justify-between items-center gap-1 ">
        <h1 className="text-lg font-bold ">Schedule</h1>
        <Card className="flex flex-row justify-between items-center p-1 gap-1 rounded-sm relative">
          <Button
            variant="outline"
            className="p-1 h-6 w-6 rounded-full"
            onClick={toggleBrainDump}
          >
            {showBrainDump ? (
              <EyeOffIcon className="w-2 h-2" />
            ) : (
              <EyeIcon className="w-2 h-2" />
            )}
          </Button>
          <Button
            variant="outline"
            className="p-1 h-6 w-6 rounded-full"
            onClick={() => setButtonIndex(buttonIndex - 1)}
          >
            <MinusIcon className="w-2 h-2" />
          </Button>
          <Button
            variant="outline"
            className="p-1 h-6 w-6 rounded-full"
            onClick={() => setButtonIndex(0)}
          >
            <TimerResetIcon className="w-2 h-2" />
          </Button>
          <Button
            variant="outline"
            className="p-1 h-6 w-6 rounded-full"
            onClick={() => setButtonIndex(buttonIndex + 1)}
          >
            <PlusIcon className="w-2 h-2" />
          </Button>
        </Card>
      </div>
      <Separator />

      <div className="grid grid-cols-5 flex-1  gap-2  p-1">
        {/* Brain Dump Column - Conditionally Rendered */}
        {showBrainDump && (
          <div className="col-span-1 bg-[#fafafa] shadow-md rounded-lg p-1">
            <h2 className="text-sm font-semibold text-gray-700 text-center">
              Brain Dump
            </h2>
            <div className="flex flex-col gap-1 flex-1 overflow-y-auto min-h-0 p-1">
              {data.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}

        {/* Date Columns */}
        {activeColumn.map((column) => (
          <div
            key={column.id}
            className="col-span-1 bg-[#fafafa] shadow-md rounded-lg p-1"
          >
            <h2 className="text-sm font-semibold text-gray-700 text-center">
              {column.title}
            </h2>
            <div className="flex flex-col gap-1 flex-1 overflow-y-auto min-h-0 p-1">
              {/* Task content will go here */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Page;
