import TaskCreateModal from "@/features/tasks/TaskCreateModal";
import { TaskModal } from "@/features/tasks/TaskModal";
import { Separator } from "@radix-ui/react-select";
import React from "react";

export const HTaskDashBoardView = ({ newTimeGroup }) => {
  return (
    <div className="flex justify-evenly w-full h-[700px]">
      {Object.keys(newTimeGroup).map((dayHeader) => (
        <div className="" key={dayHeader}>
          <div className="flex justify-center items-center space-x-2 my-2 text-center">
            <p>{dayHeader.toUpperCase()}</p>
            <p className="bg-primary text-center text-primary-foreground shadow hover:bg-primary/90 rounded-md p-1 text-xs">
              {newTimeGroup[dayHeader].length}
            </p>
          </div>
          <Separator />
          <div className="flex flex-col h-[94%] overflow-auto gap-2 pt-2">
            <TaskCreateModal />
            {newTimeGroup[dayHeader].length > 0 ? (
              newTimeGroup[dayHeader].map((task, index) => (
                <TaskModal key={index} task={task} />
              ))
            ) : (
              <p className="self-center">No Task Here.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
