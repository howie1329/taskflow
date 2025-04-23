import React from "react";
import {
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Files, Trash2 } from "lucide-react";
import { useFetchSingleSubTask } from "@/hooks/useFetchSingleSubTask";
import { useFetchSingleNote } from "@/hooks/useFetchSingleNote";
import { useRouter } from "next/navigation";
import SubtaskLineItem from "@/features/subtasks/SubtaskLineItem";
import { useAuth } from "@clerk/nextjs";
import useDeleteTask from "./hooks/useDeleteTask";
import useIsComplete from "./hooks/useIsComplete";

const TaskDialogCard = ({ task }) => {
  const { getToken } = useAuth();
  const updateMutation = useIsComplete(getToken);
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
    const data = { isCompleted: !task.isCompleted };
    updateMutation.mutate({ id: task.id, data: data });
  };

  const statusButtonColor = {
    None: "bg-primary",
    Low: "bg-blue-600",
    Medium: "bg-yellow-600",
    High: "bg-red-600",
  };
  return (
    <>
      <DialogHeader>
        <div className="flex gap-2">
          {task.labels &&
            task.labels.map((tag, key) => (
              <Button size="status" variant="tag" key={key}>
                {tag}
              </Button>
            ))}
          <Button
            size="status"
            variant="priority"
            className={statusButtonColor[task.priority]}
          >
            {task.priority}
          </Button>
        </div>
        <DialogTitle>{task.title}</DialogTitle>

        <DialogDescription>{task.description}</DialogDescription>
      </DialogHeader>
      {notesLoading ? (
        <p>Loading Notes...</p>
      ) : (
        <div className="flex gap-2">
          {notes &&
            notes.map((note, key) => (
              <Button
                variant="outline"
                key={key}
                onClick={() => noteRoute(note.id)}
              >
                <Files />
                <p>{note.title}</p>
              </Button>
            ))}
        </div>
      )}

      {subtaskLoading ? (
        <p>Loading SubTask...</p>
      ) : (
        <div>
          {subTasks &&
            subTasks.map((task, key) => (
              <SubtaskLineItem key={key} item={task} />
            ))}
        </div>
      )}

      <DialogFooter>
        <div className="flex gap-2 w-full justify-between items-center">
          <Button size="icon" variant="status" onClick={deleteButtonClick}>
            <Trash2 />
          </Button>
          {task.isCompleted ? (
            <Button
              size="status"
              variant="ghostComplete"
              onClick={completeButtonClick}
            >
              Completed
            </Button>
          ) : (
            <Button
              size="status"
              variant="ghostIncomplete"
              onClick={completeButtonClick}
            >
              Not Completed
            </Button>
          )}
          <p>{task.date}</p>
        </div>
      </DialogFooter>
    </>
  );
};

export default TaskDialogCard;
