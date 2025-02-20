"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { TaskCard } from "./taskCard";
import { CreateTaskModal } from "./modal";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Loading from "@/app/components/loading";

const fetchTask = async () => {
  try {
    const response = await axios.get("/api/todo");
    return response.data;
  } catch (error) {}
};

const Dash = () => {
  const [showModal, setShowModal] = useState(false);
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTask,
    staleTime: 60 * 10000,
  });

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
