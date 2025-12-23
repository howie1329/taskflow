"use client";
import { Separator } from "@/components/ui/separator";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  EyeIcon,
  EyeOffIcon,
  MinusIcon,
  PlusIcon,
  TimerResetIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { DndContext } from "@dnd-kit/core";
import useFetchAllTasks from "@/hooks/tasks/useFetchAllTasks";
import { ScheduleColumn } from "@/presentation/components/schedule/ScheduleColumn";
import { BrainDumpColumn } from "@/presentation/components/schedule/BrainDumpColumn";

const updateColumns = (newButtonIndex, showBrainDump) => {
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
  const { data: tasks } = useFetchAllTasks();
  const [showBrainDump, setShowBrainDump] = useState(true);
  const [buttonIndex, setButtonIndex] = useState(0);
  const [activeColumn, setActiveColumn] = useState([]);
  const [eventData, setEventData] = useState([]);

  useEffect(() => {
    const newColumns = updateColumns(buttonIndex, showBrainDump);
    setActiveColumn(newColumns);
  }, [buttonIndex, showBrainDump, tasks]);

  const toggleBrainDump = () => {
    setShowBrainDump(!showBrainDump);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over) {
      const { id: overId } = over;
      const { id: activeId } = active;
      const newData = tasks.filter((task) => task.id === activeId);
      const newEventData = {
        id: newData[0].id,
        date: overId,
        estimatedTime: 120,
        actualTime: 80,
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        task: newData[0],
      };
      setEventData([...eventData, newEventData]);
    }
  };

  return (
    <div className="flex flex-col overflow-hidden h-[96vh] border rounded-md bg-white">
      <div className="flex-shrink-0 p-1 flex flex-row justify-between items-center gap-1 ">
        <h1 className="text-lg font-bold ">Schedule</h1>
        {/* Button Group for Brain Dump and Date Columns */}
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
      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-5 flex-1 gap-2 p-1">
          {/* Brain Dump Column - Conditionally Rendered */}
          {showBrainDump && <BrainDumpColumn data={tasks} />}

          {/* Date Columns */}
          {activeColumn.map((column) => (
            <ScheduleColumn
              key={column.id}
              column={column}
              eventData={eventData}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}

export default Page;
