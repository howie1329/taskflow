"use client";
import React, { useState } from "react";
import { TaskModal } from "@/app/features/tasks/components/TaskModal";
import { EditTaskForm } from "@/app/features/tasks/components/EditTaskForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { filterTasks } from "@/lib/filterTasks";

const TaskDashboard = ({ tasksData, status, priorityFilter, isLoading }) => {
  if (isLoading) {
    return <NewLoading />;
  }

  const timeGroupings = (tasksData) => {
    const today = new Date().toISOString().split("T")[0];
    const timeGroup = { NoDeadLine: [], Today: [], ThisWeek: [], OverDue: [] };

    const isoWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const filterFinal = filterTasks(tasksData, {
      status: status,
      priorityFilter: priorityFilter,
    });

    filterFinal.map((task) => {
      const { date } = task;

      const isToday = date === today;
      const isThisWeek = date >= today && date <= isoWeek;
      const isOverDue = date < today;
      const isNoDeadLine = date == null;

      // Add Upcoming

      if (isToday) {
        timeGroup.Today.push(task);
      } else if (isThisWeek) {
        timeGroup.ThisWeek.push(task);
      } else if (isOverDue) {
        timeGroup.OverDue.push(task);
      } else if (isNoDeadLine) {
        timeGroup.NoDeadLine.push(task);
      } else {
        timeGroup.NoDeadLine.push(task);
      }
    });

    return timeGroup;
  };

  const newTimeGroup = timeGroupings(tasksData);

  return (
    <div className="flex flex-col w-full h-full gap-2">
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
              <EditTaskForm />
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
    </div>
  );
};

const NewLoading = () => {
  const loadingItem = 15;
  const timeGroup = ["NoDeadLine", "Today", "ThisWeek", "OverDue"];

  return (
    <div className="flex w-full h-[700px] gap-2">
      {timeGroup.map((heading) => (
        <div key={heading}>
          <div className="flex flex-row justify-center items-center space-x-2 my-2 text-center">
            {heading.toUpperCase()}
          </div>
          <div className="flex flex-col h-[94%] overflow-auto gap-2">
            {Array.from({ length: loadingItem }).map((_, index) => (
              <SkeletonTaskModal key={index} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const SkeletonTaskModal = () => {
  return (
    <Card className="flex flex-row w-[20rem] h-[3rem] gap-2 p-2 items-center">
      <div>
        <Skeleton className="h-3 w-3 rounded-full" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[250px]" />
      </div>
    </Card>
  );
};

export default TaskDashboard;
