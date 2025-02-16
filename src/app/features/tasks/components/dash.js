import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskCard } from "./taskCard";
import { CreateTaskModal } from "./modal";
import useUpload from "@/hooks/useUpload";

const Dash = ({ value, taskArr, setRefresh, refresh }) => {
  const [showModal, setShowModal] = useState(false);
  const { data, setData, loading, error, addTask } = useUpload("/api/todo");

  const handleModalToggle = () => {
    setShowModal(!showModal);
  };

  const handleTask = async (e) => {
    e.preventDefault();
    try {
      await addTask();
      setRefresh(!refresh);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col w-full h-full gap-2">
      <div className="flex flex-row gap-2">
        <Input
          value={data.title}
          type="text"
          onChange={(e) => setData({ title: e.target.value })}
          placeholder="Enter Your Task"
        ></Input>
        <Button onClick={handleTask}>Add Your Task</Button>
      </div>
      <Button onClick={handleModalToggle}>Test Button</Button>
      {showModal && <CreateTaskModal handleModalToggle={handleModalToggle} />}
      <h2 className="font-semibold text-xl text-center">Task List</h2>
      <ul className="flex flex-col">
        {taskArr && taskArr.map((task) => <TaskCard key={task.id} {...task} />)}
      </ul>
    </div>
  );
};

export default Dash;
