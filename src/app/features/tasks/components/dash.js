import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskCard } from "./taskCard";
import { CreateTaskModal } from "./modal";
import useUpload from "@/hooks/useUpload";

const Dash = ({ taskArr, setRefresh, refresh }) => {
  const [showModal, setShowModal] = useState(false);
  const { data, setData, loading, addTask } = useUpload("/api/todo");

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
      <div className="flex flex-row gap-2">
        <Input
          value={data.title}
          type="text"
          onChange={(e) => setData({ ...data, title: e.target.value })}
          placeholder="Enter Your Task"
        ></Input>
        <Input
          value={data.description}
          type="text"
          onChange={(e) => setData({ ...data, description: e.target.value })}
          placeholder="Enter Task Description"
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
