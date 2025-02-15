import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskCard } from "./taskCard";

const Dash = ({ value, onChange, addTask, taskArr }) => {
  return (
    <div className="flex p-5 flex-col items-center h-screen gap-2">
      <div className="flex flex-row gap-2">
        <Input
          value={value}
          type="text"
          onChange={onChange}
          placeholder="Enter Your Task"
        ></Input>
        <Button onClick={addTask}>Add Your Task</Button>
      </div>
      <h2 className="font-semibold text-xl">Task List</h2>
      <ul className="flex justify-evenly flex-wrap">
        {taskArr && taskArr.map((task) => <TaskCard key={task.id} {...task} />)}
      </ul>
    </div>
  );
};

export default Dash;
