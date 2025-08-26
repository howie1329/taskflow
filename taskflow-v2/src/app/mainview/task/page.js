"use client";
import { Separator } from "@/components/ui/separator";
import React, { useState } from "react";
import { testTaskData } from "../../../../docs/testData/testTaskData";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";

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

const GeneralKanbanTaskBoard = () => {
  const data = testTaskData;
  const [boardColumns] = useState([
    { id: "notStarted", title: "Not Started", tasks: [] },
    { id: "todo", title: "To Do", tasks: [] },
    { id: "inProgress", title: "In Progress", tasks: [] },
    { id: "done", title: "Done", tasks: [] },
    { id: "overdue", title: "Overdue", tasks: [] },
  ]);

  // Filter the board columns based on the task data
  const filteredBoardColumns = (taskData) => {
    if (!taskData) return boardColumns;
    boardColumns.forEach((column) => {
      const data = taskData.filter((task) => task.status === column.id);
      column.tasks = data;
    });
    return boardColumns;
  };

  return (
    <div className="h-full p-1">
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 h-full gap-2">
        {filteredBoardColumns(data).map((column) => (
          <div
            key={column.id}
            className="flex flex-col bg-[#fafafa] rounded-lg shadow-sm h-full min-h-0"
          >
            <h3 className="text-sm font-semibold text-gray-700 text-center py-1 flex-shrink-0">
              {column.title}
            </h3>
            <div className="flex flex-col gap-1 flex-1 overflow-y-auto min-h-0 p-1">
              {column.tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TaskCard = ({ task }) => {
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Card className="bg-white border-2 border-gray-200 rounded-lg p-1 flex-shrink-0">
      <CardContent className="flex flex-col gap-1 p-1">
        <div className="flex flex-row justify-between items-start">
          <h3 className="text-xs font-medium line-clamp-1 flex-1 min-w-0">
            {task.title}
          </h3>
          <span
            className={`${getPriorityColor(
              task.priority
            )} text-xs font-medium rounded-full px-2 py-1 whitespace-nowrap flex-shrink-0`}
          >
            {task.priority}
          </span>
        </div>
        <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>
        <div className="flex flex-row justify-between items-center text-xs text-gray-500">
          <span className="truncate">{task.status}</span>
          <span className="truncate">{task.date}</span>
        </div>
      </CardContent>
    </Card>
  );
};
