"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TaskCreateModal } from "@/features/tasks/TaskCreateModal";
import { TaskModal } from "@/features/tasks/TaskModal";

const VerticalTaskBoardView = ({ newTimeGroup }) => {
  return (
    <div className="flex flex-col space-y-4 w-full h-[90%] overflow-scroll px-2 py-4">
      {Object.keys(newTimeGroup).map((dayHeader) => (
        <Card
          key={dayHeader}
          className="w-full min-h-[200px] flex-1 p-4 transition-all duration-200 hover:shadow-lg border border-border/50"
        >
          <div className="flex w-full justify-between items-center mb-3">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold text-foreground/90">
                {dayHeader.toUpperCase()}
              </h2>
              <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-sm font-medium">
                {newTimeGroup[dayHeader].length}
              </span>
            </div>
          </div>
          <Separator className="mb-4" />
          <div className="h-full">
            <div className="flex flex-col h-[calc(100%-60px)] gap-3 pt-2 overflow-scroll custom-scrollbar">
              {newTimeGroup[dayHeader].length > 0 ? (
                newTimeGroup[dayHeader].map((task, index) => (
                  <TaskModal key={index} task={task} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <p className="text-sm">No tasks for this day</p>
                  <p className="text-xs mt-1">
                    Click the + button to add a task
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default VerticalTaskBoardView;
