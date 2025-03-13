import { Button } from "@/components/ui/button";

import React from "react";

export const TaskModalButton = ({ task }) => {
  return (
    <Button
      variant="basic"
      size="basic"
      className="w-[20rem] h-36 min-w-fit min-h-fit bg-gray-400 text-black rounded-xl p-1 "
    >
      <div className="grid grid-cols-12 grid-rows-12 w-full h-full ">
        <div className="flex col-start-1 row-start-1 col-end-13 row-end-3 space-x-2 pt-1">
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
        <div className="flex flex-col col-start-1 row-start-3 col-end-13 row-end-11 text-start">
          <h1 className="font-bold text-wrap">{task.title}</h1>
          <p className="text-xs text-wrap text-start ">{task.description}</p>
        </div>

        <div className="col-start-1 col-end-13 row-start-11 row-end-13 ">
          <div className="grid grid-cols-12 w-full h-full items-center pr-2">
            <p className="text-xs font-thin col-start-1 col-end-3">
              Date:{task.date}
            </p>
            {task.subTasks && (
              <p className="text-xs font-thin col-start-6">
                {task.subTasks.length}
              </p>
            )}
            {task.isCompleted ? (
              <p className="hover:bg-green-400 text-xs hover:text-accent-foreground bg-green-300 text-black w-fit rounded-sm px-1 h-4 font-thin ">
                Complete
              </p>
            ) : (
              <p className=" text-xs hover:text-accent-foreground bg-red-300 text-black rounded-sm px-1 h-4 w-fit font-thin col-start-9 ">
                Not Complete
              </p>
            )}
          </div>
        </div>
      </div>
    </Button>
  );
};
