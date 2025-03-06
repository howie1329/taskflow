"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { TaskCard } from "../../features/tasks/components/taskCard";
import { CreateTaskModal } from "./modal";
import Loading from "@/app/components/loading";
import useGetTasks from "@/hooks/useGetTasks";
import datas from "@/app/taskData.json";
import useUpload from "@/hooks/useUpload";
import { TaskModal } from "@/app/features/tasks/components/taskModal";

const Dash = () => {
  const [showModal, setShowModal] = useState(false);
  const { data, isLoading, error, isError } = useGetTasks();
  const mutation = useUpload();

  const onClick = () => {
    datas.map((data) => {
      mutation.mutate(data);
    });
  };

  const handleModalToggle = () => {
    setShowModal(!showModal);
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
      <Button onClick={handleModalToggle}>Add Your Task</Button>
      {showModal && <CreateTaskModal handleModalToggle={handleModalToggle} />}
      <h2 className="font-semibold text-xl text-center">Task List</h2>
      <Button onClick={onClick}>Upload JSON</Button>
      <ul className="flex gap-2 flex-wrap">
        {data && data.map((task, key) => <TaskModal key={key} task={task} />)}
      </ul>
    </div>
  );
};

export default Dash;
