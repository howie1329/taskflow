"use client";
import { Separator } from "@/components/ui/separator";
import React, { useState } from "react";
import { testTaskData } from "../../../../docs/testData/testTaskData";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";

function Page() {
  return (
    <div className="border-2 border-black ">
      <h1 className="text-xl font-bold">Task Board</h1>
      <Separator />
      <GeneralKanbanTaskBoard />
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
    <div className="p-2">
      <div className="grid grid-cols-5 grid-rows-6 gap-2">
        {filteredBoardColumns(data).map((column) => (
          <div
            key={column.id}
            className="flex flex-col bg-[#fafafa] rounded-lg shadow-sm gap-2"
          >
            <h3 className="text-base font-semibold text-gray-700 text-center">
              {column.title}
            </h3>
            <div className="flex flex-col gap-2">
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
      <CardContent className="p-2">
        <div className="flex flex-row justify-between">
          <h3 className="text-sm font-medium line-clamp-2">{task.title}</h3>
          <p
            className={`${getPriorityColor(
              task.priority
            )} text-sm font-medium rounded-full px-2 text-center inline-block h-fit`}
          >
            {task.priority}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
