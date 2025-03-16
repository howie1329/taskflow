import { Button } from "@/components/ui/button";
import useSubTaskIsComplete from "@/hooks/useSubTaskIsComplete";
import React from "react";

export const TaskCollapsibleButton = ({ task }) => {
  const mutation = useSubTaskIsComplete();

  const completeButtonClick = (subTaskItem) => {
    const updateInfo = { isComplete: !subTaskItem.isComplete };
    mutation.mutate({ id: subTaskItem.subTask_id, data: updateInfo });
  };

  const SubTaskItem = ({ item }) => {
    return (
      <div className="flex items-center space-x-1 font-thin text-sm">
        {item.isComplete ? (
          <Button
            className=" bg-green-700 h-1 w-1 rounded-full "
            onClick={() => completeButtonClick(item)}
          ></Button>
        ) : (
          <Button
            className=" bg-red-700 h-1 w-1 rounded-full "
            onClick={() => completeButtonClick(item)}
          ></Button>
        )}

        <p>{item.subTask_name}</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col mx-2 gap-2">
      <p className="text-xs text-wrap font-extralight ">{task.description}</p>

      {task.subTasks &&
        task.subTasks.map((item, key) => <SubTaskItem key={key} item={item} />)}

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
        {task.subTasks && (
          <p className="text-xs font-thin col-start-6">
            {task.subTasks.length}
          </p>
        )}
      </div>
    </div>
  );
};
