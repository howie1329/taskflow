import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Dash = ({ value, onChange, addTask, taskArr }) => {
  return (
    <>
      <Input
        value={value}
        type="text"
        onChange={onChange}
        placeholder="Enter Your Task"
      ></Input>
      <Button onClick={addTask}>Add Your Task</Button>
      <h2>Task List</h2>
      <ul>
        {taskArr && taskArr.map((task) => <li key={task.id}>{task.task}</li>)}
      </ul>
    </>
  );
};

export default Dash;
