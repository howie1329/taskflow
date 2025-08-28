"use client";
import { Separator } from "@/components/ui/separator";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { testTaskData } from "../../../../docs/testData/testTaskData";
import { Button } from "@/components/ui/button";
import { MinusIcon, PlusIcon } from "lucide-react";

const updateColumns = (newButtonIndex, showBrainDump) => {
  const columns = [];
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + newButtonIndex);

  const columnCount = showBrainDump ? 4 : 5;

  for (let i = 0; i < columnCount; i++) {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() + i);
    const day = date.toISOString().split("T")[0];
    columns.push({
      id: day,
      title: day,
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
    <div className="h-screen flex flex-col overflow-hidden bg-[#fafafa] shadow-xl rounded-lg p-1">
      <div className="flex-shrink-0 p-1 flex flex-row justify-between items-center gap-1 ">
        <h1 className="text-lg font-bold ">Schedule</h1>
        <Button variant="outline" size="icon" onClick={toggleBrainDump}>
          <p>{showBrainDump ? "Hide" : "Show"} Brain Dump</p>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setButtonIndex(buttonIndex - 1)}
        >
          <MinusIcon />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setButtonIndex(0)}>
          <p className="text-sm">Current</p>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setButtonIndex(buttonIndex + 1)}
        >
          <PlusIcon />
        </Button>
      </div>
      <Separator />

      <div className={`grid grid-cols-5 flex-1  gap-2`}>
        {/* Brain Dump Column - Conditionally Rendered */}
        {showBrainDump && (
          <div className="col-span-1 bg-white shadow-xl rounded-lg p-1">
            <h2 className="text-sm font-semibold text-center">Brain Dump</h2>
            <Separator />
            <div className="p-2 min-h-[200px]">{/* Brain dump content */}</div>
          </div>
        )}

        {/* Date Columns */}
        {activeColumn.map((column) => (
          <div
            key={column.id}
            className="col-span-1 bg-white shadow-xl rounded-lg p-1"
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
