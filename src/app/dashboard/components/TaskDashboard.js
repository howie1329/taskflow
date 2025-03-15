"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateTaskModal } from "../../features/tasks/components/CreateTask/CreateTaskModal";
import Loading from "@/app/components/loading";
import useGetTasks from "@/hooks/useGetTasks";
import datas from "@/app/taskData.json";
import useUpload from "@/hooks/useUpload";
import { EditTaskForm } from "@/app/features/tasks/components/CreateTask/EditTaskForm";
import { TaskModal } from "@/app/dashboard/components/TaskModal";

const filterTaskPriority = (data, priority) => {
  return data
    .filter((task) => task.priority === priority)
    .sort((task1, task2) => task1.position - task2.position)
    .map((task, key) => <TaskModal key={key} task={task} />);
};

const TaskPrioritySection = ({ title, tasks }) => {
  return (
    <div className="flex flex-col gap-2 items-center">
      <h2 className="font-bold">{title}</h2>
      {tasks}
      <EditTaskForm />
    </div>
  );
};

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

  const nonePriorityTasks = filterTaskPriority(data, "None");
  const lowPriorityTasks = filterTaskPriority(data, "Low");
  const mediumPriorityTasks = filterTaskPriority(data, "Medium");
  const highPriorityTasks = filterTaskPriority(data, "High");

  return (
    <div className="flex flex-col w-full h-full gap-2">
      <h1 className="font-bold text-2xl text-center">Task Flow - Dashboard</h1>
      <CreateTaskModal />
      <h2 className="font-semibold text-xl text-center">Task List</h2>
      <Button onClick={onClick}>Upload JSON</Button>
      <div className="flex justify-between ">
        <TaskPrioritySection title="None" tasks={nonePriorityTasks} />
        <TaskPrioritySection title="Low Priority" tasks={lowPriorityTasks} />
        <TaskPrioritySection
          title="Medium Priority"
          tasks={mediumPriorityTasks}
        />
        <TaskPrioritySection title="High Priority" tasks={highPriorityTasks} />
      </div>
    </div>
  );
};

export default TaskDashboard;
