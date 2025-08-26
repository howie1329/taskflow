"use client";
import { Separator } from "@/components/ui/separator";
import React, { useState } from "react";
import { testTaskData } from "../../../../docs/testData/testTaskData";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";

function Page() {
  return (
    <div className="h-full flex flex-col">
      <h1 className="text-xl font-bold p-4">Task Board</h1>
      <Separator />
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
    <div className="h-full p-2">
      <div className="grid grid-cols-5 h-full gap-2">
        {filteredBoardColumns(data).map((column) => (
          <div
            key={column.id}
            className="flex flex-col bg-[#fafafa] rounded-lg shadow-sm gap-2 h-full"
          >
            <h3 className="text-base font-semibold text-gray-700 text-center p-2">
              {column.title}
            </h3>
            <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
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
    <Card className="bg-white border-2 border-gray-200 rounded-lg p-2">
      <CardContent className="flex flex-col p-2 gap-2">
        <div className="flex flex-row justify-between items-center">
          <h3 className="text-xs font-medium line-clamp-2 flex-1 mr-2">
            {task.title}
          </h3>
          <span
            className={`${getPriorityColor(
              task.priority
            )} text-xs font-medium rounded-full px-2 py-1 whitespace-nowrap`}
          >
            {task.priority}
          </span>
        </div>
        <p className="text-xs text-gray-500">{task.description}</p>
        <div className="flex flex-row justify-between items-center">
          <p className="text-xs text-gray-500">{task.status}</p>
          <p className="text-xs text-gray-500">{task.date}</p>
        </div>
      </CardContent>
    </Card>
  );
};
