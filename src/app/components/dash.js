import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskCard } from "./taskCard";
import { CreateTaskModal } from "./modal";

const Dash = ({ value, onChange, addTask, taskArr }) => {
  const [showModal, setShowModal] = useState(false);

  const handleModalToggle = () => {
    setShowModal(!showModal);
  };

  return (
    <div className="flex flex-col w-full h-full gap-2">
      <div className="flex flex-row gap-2">
        <Input
          value={value}
          type="text"
          onChange={onChange}
          placeholder="Enter Your Task"
        ></Input>
        <Button onClick={addTask}>Add Your Task</Button>
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
