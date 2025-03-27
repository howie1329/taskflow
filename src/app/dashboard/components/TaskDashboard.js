"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import Loading from "@/app/components/loading";
import useGetTasks from "@/hooks/useGetTasks";
import datas from "@/app/taskData.json";
import useUpload from "@/hooks/useUpload";
import { TaskModal } from "@/app/features/tasks/components/TaskModal";

const TaskDashboard = () => {
  const { data, isLoading, error, isError } = useGetTasks();
  const mutation = useUpload();

  const onClick = () => {
    datas.map((data) => {
      mutation.mutate(data);
    });
  };

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
    <div className="flex flex-col w-full h-screen gap-2">
      <h2 className="font-semibold text-xl text-center">Task Cards</h2>
      <Button onClick={onClick}>Upload JSON</Button>
      <div className="flex justify-evenly ">
        {Object.keys(newTaskGroup).map((dayHeader) => (
          <div className="w-full h-full" key={dayHeader}>
            <p>{dayHeader}</p>
            <div className="flex flex-col h-full overflow-scroll gap-2">
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
