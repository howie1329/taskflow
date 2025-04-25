import React from "react";
import {
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Files, Trash2, CheckCircle2, Circle } from "lucide-react";
import { useFetchSingleSubTask } from "@/features/subtasks/hooks/useFetchSingleSubTask";
import { useFetchSingleNote } from "@/features/notes/hooks/useFetchSingleNote";
import { useRouter } from "next/navigation";
import SubtaskLineItem from "@/features/subtasks/SubtaskLineItem";
import { useAuth } from "@clerk/nextjs";
import useDeleteTask from "./hooks/useDeleteTask";
import useTaskComplete from "./hooks/completehooks/useTaskComplete";
import useTaskIncomplete from "./hooks/completehooks/useTaskIncomplete";

const TaskDialogCard = ({ task }) => {
  const { getToken } = useAuth();
  const completeMutation = useTaskComplete();
  const incompleteMutation = useTaskIncomplete();
  const deleteMutation = useDeleteTask(getToken);
  const router = useRouter();

  const { data: subTasks, isLoading: subtaskLoading } = useFetchSingleSubTask(
    task.id
  );
  const { data: notes, isLoading: notesLoading } = useFetchSingleNote(task.id);

  const noteRoute = (notesId) => {
    router.push(`/dashboard/notes/${notesId}`);
  };

  const deleteButtonClick = () => {
    deleteMutation.mutate({ id: task.id });
  };

  const completeButtonClick = () => {
    if (task.isCompleted) {
      incompleteMutation.mutate(task.id);
    } else {
      completeMutation.mutate(task.id);
    }
  };

  const statusButtonColor = {
    None: "bg-primary",
    Low: "bg-blue-600",
    Medium: "bg-yellow-600",
    High: "bg-red-600",
  };

  return (
    <div className="space-y-6">
      <DialogHeader className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="flex gap-2">
            {task.labels?.map((tag, key) => (
              <Button size="sm" variant="tag" key={key} className="text-xs">
                {tag}
              </Button>
            ))}
          </div>
          <Button
            size="sm"
            variant="priority"
            className={`${statusButtonColor[task.priority]} text-white`}
          >
            {task.priority}
          </Button>
        </div>

        <div className="space-y-2">
          <DialogTitle className="text-2xl font-semibold">
            {task.title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {task.description}
          </DialogDescription>
        </div>
      </DialogHeader>

      <div className="space-y-6">
        {/* Notes Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-500">
            Associated Notes
          </h3>
          {notesLoading ? (
            <p className="text-sm text-gray-500">Loading Notes...</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {notes?.map((note, key) => (
                <Button
                  variant="outline"
                  key={key}
                  onClick={() => noteRoute(note.id)}
                  className="flex items-center gap-2 hover:bg-gray-50"
                >
                  <Files className="h-4 w-4" />
                  <span className="text-sm">{note.title}</span>
                </Button>
              ))}
              {(!notes || notes.length === 0) && (
                <p className="text-sm text-gray-500">No notes attached</p>
              )}
            </div>
          )}
        </div>

        {/* Subtasks Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-500">Subtasks</h3>
          {subtaskLoading ? (
            <p className="text-sm text-gray-500">Loading Subtasks...</p>
          ) : (
            <div className="space-y-2">
              {subTasks?.map((task, key) => (
                <SubtaskLineItem key={key} item={task} />
              ))}
              {(!subTasks || subTasks.length === 0) && (
                <p className="text-sm text-gray-500">No subtasks added</p>
              )}
            </div>
          )}
        </div>
      </div>

      <DialogFooter>
        <div className="flex w-full items-center justify-between border-t pt-4">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={deleteButtonClick}
              className="hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              onClick={completeButtonClick}
              className={`flex items-center gap-2 ${
                task.isCompleted
                  ? "text-green-600 hover:bg-green-50"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {task.isCompleted ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
              <span className="text-sm">
                {task.isCompleted ? "Completed" : "Mark as Complete"}
              </span>
            </Button>
          </div>
          <p className="text-sm text-gray-500">{task.date}</p>
        </div>
      </DialogFooter>
    </div>
  );
};

export default TaskDialogCard;
