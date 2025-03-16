import React from "react";
import {
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import useIsComplete from "@/hooks/useIsComplete";
import useDeleteTask from "@/hooks/useDeleteTask";
import { useFetchSingleSubTask } from "@/hooks/useFetchSingleSubTask";

const TaskDialogCard = ({ task }) => {
  const updateMutation = useIsComplete();
  const deleteMutation = useDeleteTask();

  const { data: subTasks, isLoading } = useFetchSingleSubTask(task.id);

  const deleteButtonClick = () => {
    deleteMutation.mutate({ id: task.id });
  };

  const completeButtonClick = () => {
    const data = { isCompleted: !task.isCompleted };
    updateMutation.mutate({ id: task.id, data: data });
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
          <Button size="status" variant="priority">
            {task.priority}
          </Button>
        </div>
        <DialogTitle>{task.title}</DialogTitle>

        <DialogDescription>{task.description}</DialogDescription>
      </DialogHeader>

      {isLoading ? (
        <p>Loading SubTask...</p>
      ) : (
        <div>
          {subTasks && <p>Sub Tasks:{subTasks.length}</p>}
          {subTasks &&
            subTasks.map((task, key) => <p key={key}>{task.subTask_name}</p>)}
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
          <p>Due Date: {task.date}</p>
        </div>
      </DialogFooter>
    </>
  );
};

export default TaskDialogCard;
