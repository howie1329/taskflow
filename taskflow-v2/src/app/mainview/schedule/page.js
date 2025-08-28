"use client";
import { Separator } from "@/components/ui/separator";
import React, { useEffect, useMemo, useState } from "react";
import { testTaskData } from "../../../../docs/testData/testTaskData";
import { Button } from "@/components/ui/button";
import { MinusIcon, PlusIcon } from "lucide-react";

function Page() {
  const data = testTaskData;
  const [showBrainDump, setShowBrainDump] = useState(true);
  const [buttonIndex, setButtonIndex] = useState(0);
  const [activeColumn, setActiveColumn] = useState([]);

  // Make updateColumns dynamic based on brain dump visibility
  const updateColumns = (newButtonIndex) => {
    const columns = [];
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + newButtonIndex);

    // Create 4 or 5 columns depending on brain dump visibility
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

  useEffect(() => {
    const newColumns = updateColumns(buttonIndex);
    setActiveColumn(newColumns);
  }, [buttonIndex, showBrainDump]); // Add showBrainDump to dependencies

  const toggleBrainDump = () => {
    setShowBrainDump(!showBrainDump);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-shrink-0 p-1 flex flex-row justify-between items-center gap-1">
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

      <div
        className={`grid grid-cols-5 flex-1 bg-[#fafafa] gap-2 border-black border-2`}
      >
        {/* Brain Dump Column - Conditionally Rendered */}
        {showBrainDump && (
          <div className="col-span-1 bg-white border-black border-2 rounded-lg p-1">
            <h2 className="text-sm font-semibold text-center">Brain Dump</h2>
            <Separator />
            <div className="p-2 min-h-[200px]">{/* Brain dump content */}</div>
          </div>
        )}

        {/* Date Columns */}
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
