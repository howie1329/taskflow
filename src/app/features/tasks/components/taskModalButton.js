import { Button } from "@/components/ui/button";
import useIsComplete from "@/hooks/useIsComplete";

import React from "react";

export const TaskModalButton = ({ task }) => {
  const updateMutation = useIsComplete();

  const completeButtonClick = () => {
    const data = { isCompleted: !task.isCompleted };
    updateMutation.mutate({ id: id, data: data });
  };
  return (
    <Button className=" w-60 h-32 min-w-fit min-h-fit bg-gray-400 text-black">
      <div className="flex flex-col flex-1">
        <div className="flex justify-between">
          <div className="flex gap-2">
            {task.labels &&
              task.labels.map((tag, key) => (
                <p
                  className=" text-center w-fit h-fit text-black bg-blue-500 rounded-md px-1 text-xs font-thin "
                  key={key}
                >
                  {tag}
                </p>
              ))}
            <p className=" text-center w-fit h-fit bg-rose-400 text-black rounded-md px-1 text-xs font-thin ">
              {task.priority}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-start">
          <h1 className="font-bold">{task.title}</h1>
          <p className="text-xs text-wrap text-start">{task.description}</p>
          {task.isCompleted ? (
            <p className="hover:bg-green-400 text-xs hover:text-accent-foreground bg-green-300 text-black rounded-md px-1 self-end font-thin ">
              Complete
            </p>
          ) : (
            <p className=" text-xs hover:text-accent-foreground bg-red-300 text-black rounded-md px-1 self-end font-thin ">
              Not Complete
            </p>
          )}
          <p className="text-xs self-end font-thin ">{task.date}</p>
          <div>{task.subTasks && <p>{task.subTasks.length}</p>}</div>
        </div>
      </div>
    </Button>
  );
};
