import React from "react";
import SubtaskLineItem from "@/features/subtasks/SubtaskLineItem";
import { useFetchSingleSubTask } from "@/features/subtasks/hooks/useFetchSingleSubTask";

const TaskDescription = ({ description }) => (
  <p className="text-xs text-wrap font-extralight">{description}</p>
);

const SubtasksList = ({ subtasks }) => (
  <>
    {subtasks?.map((item, index) => (
      <SubtaskLineItem key={`subtask-${item.id || index}`} item={item} />
    ))}
  </>
);

export const TaskCollapsibleButton = ({ task }) => {
  const { data: subtasks, isLoading, error } = useFetchSingleSubTask(task.id);

  if (error) {
    return <div className="text-xs text-red-500">Error loading subtasks</div>;
  }

  return (
    <div className="flex flex-col mx-2 gap-2">
      <TaskDescription description={task.description} />
      <SubtasksList subtasks={subtasks} />
    </div>
  );
};
