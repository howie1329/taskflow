import React, { useState } from "react";

function TaskBoardView() {
  const [columns] = useState([
    { id: "notStarted", title: "Not Started", tasks: [] },
    { id: "todo", title: "To Do", tasks: [] },
    { id: "inProgress", title: "In Progress", tasks: [] },
    { id: "done", title: "Done", tasks: [] },
    { id: "overdue", title: "Overdue", tasks: [] },
  ]);

  return (
    <div className="flex gap-4 p-6 h-[calc(100vh-64px)] overflow-x-auto bg-gray-50 w-full">
      {columns.map((column) => (
        <div
          key={column.id}
          className="bg-white rounded-lg flex-1 min-w-[300px] h-fit max-h-full flex flex-col shadow-sm"
        >
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-base font-semibold text-gray-700 m-0">
              {column.title}
            </h3>
            <span className="bg-gray-100 px-2 py-1 rounded-full text-sm text-gray-600">
              {column.tasks.length}
            </span>
          </div>
          <div className="p-2 flex-1 overflow-y-auto">
            {column.tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white border border-gray-200 rounded-md p-4 mb-2 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <h4 className="text-sm font-medium text-gray-700 mb-2 m-0">
                  {task.title}
                </h4>
                <p className="text-xs text-gray-600 m-0">{task.description}</p>
              </div>
            ))}
            <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-md text-gray-600 cursor-pointer transition-all duration-200 hover:border-gray-400 hover:text-gray-700">
              + Add Task
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TaskBoardView;
