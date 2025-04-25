import React, { useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import TaskDialogCard from "../TaskDialogCard";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useTaskUpdateField from "../hooks/useTaskUpdateField";
import useTaskComplete from "../hooks/completehooks/useTaskComplete";
import useTaskIncomplete from "../hooks/completehooks/useTaskIncomplete";
import { useQueryClient } from "@tanstack/react-query";
import { singleSubTask } from "@/features/subtasks/hooks/useFetchSingleSubTask";
import { singleNote } from "@/features/notes/hooks/useFetchNote";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TaskCard = ({ task }) => {
  const { getToken } = useAuth();
  const completeMutation = useTaskComplete();
  const incompleteMutation = useTaskIncomplete();
  const updateFieldMutation = useTaskUpdateField(getToken);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const queryClient = useQueryClient();

  const statusOptions = [
    { id: "notStarted", title: "Not Started" },
    { id: "todo", title: "ToDo" },
    { id: "inProgress", title: "In Progress" },
    { id: "done", title: "Done" },
    { id: "overdue", title: "Overdue" },
  ];

  const handleCompleteChange = () => {
    if (!task.isCompleted) {
      completeMutation.mutate(task.id);
    } else {
      incompleteMutation.mutate(task.id);
    }
  };

  const handleTitleUpdate = () => {
    if (title !== task.title) {
      updateFieldMutation.mutate({
        id: task.id,
        changedField: "title",
        updateData: title,
      });
    }
    setIsEditingTitle(false);
  };

  const handleDescriptionUpdate = () => {
    if (description !== task.description) {
      updateFieldMutation.mutate({
        id: task.id,
        changedField: "description",
        updateData: description,
      });
    }
    setIsEditingDescription(false);
  };

  const handleKeyPress = (e, updateFunction) => {
    if (e.key === "Enter") {
      e.preventDefault();
      updateFunction();
    }
  };

  const handleStatusChange = (value) => {
    updateFieldMutation.mutate({
      id: task.id,
      changedField: "status",
      updateData: value,
    });
  };

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

  const getStatusColor = (status) => {
    switch (status) {
      case "notStarted":
        return "bg-gray-100 text-gray-700 border border-gray-200 rounded-full px-1";
      case "todo":
        return "bg-blue-100 text-blue-700 border border-gray-200 rounded-full px-1";
      case "inProgress":
        return "bg-yellow-100 text-yellow-700 border border-gray-200 rounded-full px-1";
      case "done":
        return "bg-green-100 text-green-700 border border-gray-200 rounded-full px-1";
      case "overdue":
        return "bg-red-100 text-red-700 border border-gray-200 rounded-full px-1";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200 rounded-full px-1";
    }
  };

  const preFetchData = () => {
    queryClient.prefetchQuery({
      queryKey: ["subtasks", task.id],
      queryFn: () => singleSubTask(task.id, getToken),
      staleTime: 300_000,
    });
    queryClient.prefetchQuery({
      queryKey: ["notes", task.id],
      queryFn: () => singleNote(task.id, getToken),
      staleTime: 300_000,
    });
  };

  return (
    <Dialog>
      <DialogTrigger className="w-full" onMouseEnter={preFetchData}>
        <div className="bg-white border border-gray-200 rounded-lg py-4 px-2 mb-2 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 w-full">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-start gap-2 flex-1">
              <Checkbox
                checked={task.isCompleted}
                onCheckedChange={handleCompleteChange}
                onClick={(e) => e.stopPropagation()}
                className="mt-1"
              />
              {isEditingTitle ? (
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleUpdate}
                  onKeyPress={(e) => handleKeyPress(e, handleTitleUpdate)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-6 text-sm"
                  autoFocus
                />
              ) : (
                <h4
                  className={`text-sm font-medium text-gray-900 m-0 line-clamp-2 ${
                    task.isCompleted ? "line-through text-gray-500" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingTitle(true);
                  }}
                >
                  {task.title}
                </h4>
              )}
            </div>
            <div className="flex items-center gap-2">
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
          </div>

          {isEditingDescription ? (
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionUpdate}
              onKeyPress={(e) => handleKeyPress(e, handleDescriptionUpdate)}
              onClick={(e) => e.stopPropagation()}
              className="text-xs min-h-[60px] mb-3"
              autoFocus
            />
          ) : (
            <p
              className="text-xs text-gray-600 mb-3 line-clamp-2"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingDescription(true);
              }}
            >
              {task.description}
            </p>
          )}

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
            <Select
              value={task.status}
              onValueChange={(value) => {
                handleStatusChange(value);
              }}
            >
              <SelectTrigger
                className={`h-5 w-fit text-xs font-medium border-none bg-transparent ${getStatusColor(
                  task.status
                )}`}
              >
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
