"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateTaskModal } from "../../features/tasks/components/CreateTaskModal";
import Loading from "@/app/components/loading";
import useGetTasks from "@/hooks/useGetTasks";
import datas from "@/app/taskData.json";
import useUpload from "@/hooks/useUpload";
import { TaskModal } from "@/app/features/tasks/components/taskModal";
import { EditTaskCard } from "@/app/features/tasks/components/editTaskCard";

const Dash = () => {
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

  return (
    <div className="flex flex-col w-full h-full gap-2">
      <h1 className="font-bold text-2xl text-center">Task Flow - Dashboard</h1>
      <CreateTaskModal />
      <h2 className="font-semibold text-xl text-center">Task List</h2>
      <Button onClick={onClick}>Upload JSON</Button>
      <div className="flex gap-2 flex-wrap">
        {data && data.map((task, key) => <TaskModal key={key} task={task} />)}
      </div>
      <EditTaskCard />
    </div>
  );
};

export default Dash;
