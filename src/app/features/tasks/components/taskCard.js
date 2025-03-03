import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useIsComplete from "@/hooks/useIsComplete";
import useDeleteTask from "@/hooks/useDeleteTask";

export const TaskCard = ({
  title,
  description = null,
  date = null,
  id,
  isCompleted,
  subTasks,
}) => {
  const updateMutation = useIsComplete();
  const deleteMutation = useDeleteTask();

  const deleteButtonClick = () => {
    deleteMutation.mutate({ id: id });
  };

  const completeButtonClick = () => {
    const data = { isCompleted: !isCompleted };
    updateMutation.mutate({ id: id, data: data });
  };
  return (
    <Card className="flex flex-col mb-2 p-1">
      <CardHeader>
        <div className="flex flex-row justify-between">
          <CardTitle>{title}</CardTitle>
          <Button size="icon" variant="status" onClick={deleteButtonClick}>
            D
          </Button>
        </div>
        <CardDescription>
          {description}
          <div>
            {subTasks && <p>Sub Tasks:{subTasks.length}</p>}
            {subTasks &&
              subTasks.map((task, key) => (
                <p key={task.id}>{task.subTask_name}</p>
              ))}
          </div>
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <div className="flex gap-2">
          {isCompleted ? (
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
          <div>Due Date: {date}</div>
        </div>
      </CardFooter>
    </Card>
  );
};
