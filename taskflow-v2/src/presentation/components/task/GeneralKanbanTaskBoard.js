"use client";
import { TaskCard } from "./TaskCard";
import { useState } from "react";
import { testTaskData } from "../../../../docs/testData/testTaskData";

export const GeneralKanbanTaskBoard = () => {
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
