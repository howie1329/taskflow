import React, { useState, useMemo } from "react";
import useGetTasks from "../hooks/useGetTasks";
import { useAuth } from "@clerk/nextjs";
import { TaskCreateModal } from "../TaskCreateModal";
import { TaskCreateDialog } from "../TaskCreateDialog";
import TaskCard from "./TaskCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
function TaskBoardView() {
  const { userId } = useAuth();
  const { data: tasks, isLoading: isTaskLoading } = useGetTasks(userId);
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [columns] = useState([
    { id: "notStarted", title: "Not Started", tasks: [] },
    { id: "todo", title: "To Do", tasks: [] },
    { id: "inProgress", title: "In Progress", tasks: [] },
    { id: "done", title: "Done", tasks: [] },
    { id: "overdue", title: "Overdue", tasks: [] },
  ]);
  const [userSearch, setUserSearch] = useState("");

  const getPriorityWeight = (priority) => {
    switch (priority) {
      case "High":
        return 3;
      case "Medium":
        return 2;
      case "Low":
        return 1;
      default:
        return 0;
    }
  };

  const newColumns = (taskData) => {
    if (!taskData) return columns;

    columns.forEach((item) => {
      const data = taskData
        .filter((task) => {
          const matchesStatus = task.status === item.id;
          const matchesPriority =
            selectedPriority === "All" || task.priority === selectedPriority;
          return matchesStatus && matchesPriority;
        })
        .sort(
          (a, b) =>
            getPriorityWeight(b.priority) - getPriorityWeight(a.priority)
        );
      item.tasks = data;
    });

    const filteredColumns = columns.map((column) => ({
      ...column,
      tasks: column.tasks.filter((task) =>
        task.title.toLowerCase().includes(userSearch.toLowerCase())
      ),
    }));

    return filteredColumns;
  };

  const newColumn = newColumns(tasks);

  if (isTaskLoading) {
    return (
      <div className="flex gap-4 p-6 h-[calc(100vh-64px)] overflow-x-auto bg-gray-50 w-full">
        {columns.map((column) => (
          <div
            key={column.id}
            className="bg-white rounded-lg flex-1 min-w-[300px] h-fit max-h-full flex flex-col shadow-sm"
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-8 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            <div className="p-2 flex-1 overflow-y-auto">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-md p-4 mb-2"
                >
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="p-4 bg-white border-b">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            Filter by Priority:
          </label>
          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Priorities</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="None">None</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="pr-8 focus:bg-gray-50 w-full"
            />
            {userSearch && (
              <button
                onClick={() => setUserSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-4 p-6 overflow-x-auto bg-gray-50 w-full">
        {newColumn.map((column) => (
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
                <TaskCard key={task.id} task={task} />
              ))}
              <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-md text-gray-600 cursor-pointer transition-all duration-200 hover:border-gray-400 hover:text-gray-700">
                <TaskCreateDialog plain={true} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TaskBoardView;
