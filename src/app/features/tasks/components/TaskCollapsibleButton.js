import { useFetchSingleSubTask } from "@/hooks/useFetchSingleSubTask";
import React from "react";
import SubtaskLineItem from "../../subtask/SubtaskLineItem";

export const TaskCollapsibleButton = ({ task }) => {
  const { data: subTasks } = useFetchSingleSubTask(task.id);

  return (
    <div className="flex flex-col mx-2 gap-2">
      <p className="text-xs text-wrap font-extralight ">{task.description}</p>

      {subTasks &&
        subTasks.map((item, key) => <SubtaskLineItem key={key} item={item} />)}
    </div>
  );
};
