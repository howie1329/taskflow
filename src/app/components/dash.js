import React from "react";

const Dash = ({ value, type, onChange, placeholder, addTask, taskArr }) => {
  return (
    <>
      <input
        value={value}
        type={type}
        onChange={onChange}
        placeholder={placeholder}
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
