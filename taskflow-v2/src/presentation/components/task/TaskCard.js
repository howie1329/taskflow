import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { TaskCardDialog } from "./TaskCardDialog";
import { useState } from "react";

export const TaskCard = ({ task }) => {
  const [isOpen, setIsOpen] = useState(false);

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

  const getCorrectedStatus = (status) => {
    switch (status) {
      case "notStarted":
        return "Not Started";
      case "todo":
        return "Todo";
      case "inProgress":
        return "In Progress";
      case "done":
        return "Done";
      case "overdue":
        return "Overdue";
      default:
        return status;
    }
  };

  return (
    <>
      <Card
        className="bg-white rounded-lg p-1 flex-shrink-0 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsOpen(true)}
      >
        <CardContent className="flex flex-col gap-1 p-1">
          <div className="flex flex-row justify-between gap-1 items-center">
            <Checkbox checked={task.isCompleted} />
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
          <p className="text-xs text-gray-500 line-clamp-2">
            {task.description}
          </p>
          <div className="flex flex-row justify-between items-center text-xs text-gray-500">
            <span className="truncate">{getCorrectedStatus(task.status)}</span>
            <span className="truncate">{task.date}</span>
          </div>
        </CardContent>
      </Card>

      <TaskCardDialog
        selectedTask={task}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  );
};
