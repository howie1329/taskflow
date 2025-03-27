"use client";
import React from "react";
import Loading from "@/app/components/loading";
import useGetTasks from "@/hooks/useGetTasks";
import { TaskModal } from "@/app/features/tasks/components/TaskModal";
import { EditTaskForm } from "@/app/features/tasks/components/EditTaskForm";

const TaskDashboard = () => {
  const { data, isLoading, error, isError } = useGetTasks();

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <p>{error.message}</p>;
  }

  const timeGroupings = (tasksData) => {
    const today = new Date().toISOString().split("T")[0];
    const timeGroup = { NoDeadLine: [], Today: [], ThisWeek: [], OverDue: [] };

    const isoWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    tasksData.map((task) => {
      console.log(task);
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

  const newTaskGroup = timeGroupings(data);

  return (
    <div className="flex flex-col w-full h-full gap-2">
      <div className="flex justify-evenly w-full h-[700px]  ">
        {Object.keys(newTaskGroup).map((dayHeader) => (
          <div className="" key={dayHeader}>
            <div className="flex justify-center items-center space-x-2 my-2 text-center">
              <p>{dayHeader.toUpperCase()}</p>
              <p className="bg-primary text-center text-primary-foreground shadow hover:bg-primary/90 rounded-md p-1 text-xs">
                {newTaskGroup[dayHeader].length}
              </p>
            </div>

            <div className="flex flex-col h-[94%] overflow-auto gap-2">
              <EditTaskForm />
              {newTaskGroup[dayHeader].length > 0 ? (
                newTaskGroup[dayHeader].map((task, index) => (
                  <TaskModal key={index} task={task} />
                ))
              ) : (
                <p>No Task Here.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskDashboard;
