import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { TaskCard } from "./taskCard";
import { CreateTaskModal } from "./modal";

const Dash = ({ taskArr, setRefresh, refresh }) => {
  const [showModal, setShowModal] = useState(false);
  //const { data, setData, loading, addTask } = useUpload("/api/todo");

  const handleModalToggle = () => {
    setShowModal(!showModal);
  };

  const handleTask = async (e) => {
    e.preventDefault();
    try {
      console.log(data);
      await addTask();
      setRefresh(!refresh);
      setData({ title: "", description: "" });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col w-full h-full gap-2">
      <Button onClick={handleModalToggle}>Add Your Task</Button>
      {showModal && <CreateTaskModal handleModalToggle={handleModalToggle} />}
      <h2 className="font-semibold text-xl text-center">Task List</h2>
      <ul className="flex flex-col">
        {taskArr && taskArr.map((task) => <TaskCard key={task.id} {...task} />)}
      </ul>
    </div>
  );
};

export default Dash;
