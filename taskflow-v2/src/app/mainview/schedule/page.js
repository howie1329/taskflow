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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TaskCard } from "@/presentation/components/task/TaskCard";
import { DndContext, useDroppable } from "@dnd-kit/core";
import useFetchAllTasks from "@/hooks/tasks/useFetchAllTasks";

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
    <div className="flex flex-col overflow-hidden h-[93vh]">
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

const BrainDumpColumn = ({ data }) => {
  // Loading State If No Data
  if (!data) {
    return (
      <div className="col-span-1 bg-[#fafafa] shadow-md rounded-lg p-1">
        <h2 className="text-sm font-semibold text-gray-700 text-center">
          Brain Dump
        </h2>
        <div className="flex flex-col gap-1 flex-1 overflow-y-auto min-h-0 p-1">
          <p className="text-xs text-gray-500 text-center">Loading...</p>
        </div>
      </div>
    );
  }

  return (
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
  );
};

const ScheduleColumn = ({ column, eventData }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: column.id,
  });

  const style = {
    backgroundColor: isOver ? "lightgreen" : undefined,
  };
  return (
    <div
      key={column.id}
      className="col-span-1 bg-[#fafafa] shadow-md rounded-lg p-1"
      ref={setNodeRef}
      style={style}
    >
      <h2 className="text-sm font-semibold text-gray-700 text-center">
        {column.title}
      </h2>
      <div className="flex flex-col gap-1 flex-1 overflow-y-auto min-h-0 p-1">
        {eventData
          .filter((event) => event.date === column.id)
          .map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
      </div>
    </div>
  );
};
export default Page;

const EventCard = ({ event }) => {
  return (
    <Card className="bg-white rounded-lg p-1 flex-shrink-0 cursor-pointer hover:bg-gray-50">
      <CardContent className="flex flex-col gap-1 p-1">
        <h3 className="text-xs font-medium line-clamp-1 flex-1 min-w-0">
          {event.task.title}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2">
          {event.task.description}
        </p>
        <div className="flex flex-row gap-1">
          <p className="text-xs text-gray-500 line-clamp-1">
            Time: {event.time}
          </p>
          <p className="text-xs text-gray-500 line-clamp-1">
            Estimated Time: {event.estimatedTime} minutes
          </p>
          <p className="text-xs text-gray-500 line-clamp-1">
            Actual Time: {event.actualTime} minutes
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
