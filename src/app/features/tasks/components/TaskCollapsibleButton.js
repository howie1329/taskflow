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

      <div className="flex justify-between items-center">
        {task.isCompleted ? (
          <p className="hover:bg-green-400 text-xs hover:text-accent-foreground bg-green-300 text-black w-fit rounded-sm px-1 h-4 font-thin ">
            Complete
          </p>
        ) : (
          <p className=" text-xs hover:text-accent-foreground bg-red-300 text-black rounded-sm px-1 h-4 w-fit font-thin col-start-9 ">
            Not Complete
          </p>
        )}
        <p>Date:{task.date}</p>
        {subTasks && (
          <p className="text-xs font-thin col-start-6">{subTasks.length}</p>
        )}
      </div>
    </div>
  );
};
