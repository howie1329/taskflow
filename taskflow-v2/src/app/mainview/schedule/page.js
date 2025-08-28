"use client";
import { Separator } from "@/components/ui/separator";
import React, { useEffect, useMemo, useState } from "react";
import { testTaskData } from "../../../../docs/testData/testTaskData";
import { Button } from "@/components/ui/button";
import { MinusIcon, PlusIcon } from "lucide-react";

function Page() {
  const data = testTaskData;
  const initialColumns = useMemo(
    () => [
      {
        id: "brainDump",
        title: "Brain Dump",
        tasks: [],
      },
    ],
    []
  );

  // Keep getTestColumns for initialization
  const getTestColumns = (size) => {
    const columns = [...initialColumns];
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + buttonIndex);
    for (let i = 0; i < size; i++) {
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

  // Separate function for updates
  const updateColumns = (newButtonIndex) => {
    const columns = [];
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + newButtonIndex);
    for (let i = 0; i < 4; i++) {
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

  const [buttonIndex, setButtonIndex] = useState(0);
  const [activeColumn, setActiveColumn] = useState([
    ...getTestColumns(4), // Used only for initialization
  ]);

  useEffect(() => {
    const newColumns = updateColumns(buttonIndex); // Separate function for updates
    setActiveColumn(newColumns);
  }, [buttonIndex]);

  const handleRemoveBrainDump = () => {
    const newActiveColumn = activeColumn.filter(
      (column) => column.id !== "brainDump"
    );
    if (newActiveColumn.length < 5) {
      const fixedColumns = [...getTestColumns(5)];
      setActiveColumn(fixedColumns);
      return;
    }
    setActiveColumn(newActiveColumn);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-shrink-0 p-1 flex flex-row justify-between items-center gap-1">
        <h1 className="text-lg font-bold ">Schedule</h1>
        <Button variant="outline" size="icon" onClick={handleRemoveBrainDump}>
          <p>Remove Brain Dump</p>
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
