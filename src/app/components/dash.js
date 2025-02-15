import React from "react";

const Dash = ({ value, onChange, addTask, taskArr }) => {
  return (
    <>
      <input
        value={value}
        type="text"
        onChange={onChange}
        placeholder="Enter Your Task"
      ></input>
      <button onClick={addTask}>Add Your Task</button>
      <h2>Task List</h2>
      <ul>
        {taskArr && taskArr.map((task) => <li key={task.id}>{task.task}</li>)}
      </ul>
    </>
  );
};

export default Dash;
