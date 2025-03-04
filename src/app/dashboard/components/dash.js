"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { TaskCard } from "../../features/tasks/components/taskCard";
import { CreateTaskModal } from "./modal";
import Loading from "@/app/components/loading";
import useGetTasks from "@/hooks/useGetTasks";

const Dash = () => {
  const [showModal, setShowModal] = useState(false);
  const { data, isLoading, error, isError } = useGetTasks();

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
      <Button onClick={handleModalToggle}>Add Your Task</Button>
      {showModal && <CreateTaskModal handleModalToggle={handleModalToggle} />}
      <h2 className="font-semibold text-xl text-center">Task List</h2>
      <ul className="flex flex-col">
        {data && data.map((task, key) => <TaskCard key={key} {...task} />)}
      </ul>
    </div>
  );
};

export default Dash;
