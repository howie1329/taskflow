"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TaskCreateModal } from "@/features/tasks/TaskCreateModal";
import { TaskModal } from "@/features/tasks/TaskModal";

const VerticalTaskBoardView = ({ newTimeGroup }) => {
  return (
    <div className="flex flex-col space-y-2 w-full h-[700px] overflow-scroll">
      {Object.keys(newTimeGroup).map((dayHeader) => (
        <Card key={dayHeader} className="w-full h-[60%] p-2">
          <div className="flex w-full justify-center items-center space-x-2 my-2 text-center">
            <p>{dayHeader.toUpperCase()}</p>
            <p className="bg-primary text-center text-primary-foreground shadow hover:bg-primary/90 rounded-md p-1 text-xs">
              {newTimeGroup[dayHeader].length}
            </p>
          </div>
          <Separator />
          <div className="h-full">
            <div className="flex flex-col h-[87%] gap-2 pt-2 overflow-scroll">
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
        </Card>
      ))}
    </div>
  );
};

export default VerticalTaskBoardView;
