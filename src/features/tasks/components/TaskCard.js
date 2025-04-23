import React from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import TaskDialogCard from "../TaskDialogCard";

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
    <Dialog>
      <DialogTrigger className="w-full">
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-2 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 w-full">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900 m-0 line-clamp-2">
              {task.title}
            </h4>
            {task.priority && (
              <span
                className={`${getPriorityColor(
                  task.priority
                )} px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0`}
              >
                {task.priority}
              </span>
            )}
          </div>

          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {task.description}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500">
            {task.date && (
              <div className="flex items-center">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {format(new Date(task.date), "MMM d, yyyy")}
              </div>
            )}

            {task.assignee && (
              <div className="flex items-center">
                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                  {task.assignee.charAt(0).toUpperCase()}
                </div>
                <span className="ml-1">{task.assignee}</span>
              </div>
            )}
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <TaskDialogCard task={task} />
      </DialogContent>
    </Dialog>
  );
};

export default TaskCard;
