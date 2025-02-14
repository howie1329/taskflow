"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

function Page() {
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/todo")
      .then((response) => {
        setTasks(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const addTask = () => {
    console.log({ task: taskTitle });
    setLoading(true);
    axios
      .post("/api/todo", { task: taskTitle })
      .then((response) => {
        console.log(response);
        setTasks([...tasks, response.data]);
        setTaskTitle("");
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const Display = () => {
    if (loading) {
      return <p>Loading...</p>;
    } else {
      return (
        <div>
          <h1>Task Flow - Dashboard</h1>
          <input
            value={taskTitle}
            type="text"
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="Enter Your Task"
          ></input>
          <button onClick={addTask}>Add Your Task</button>
          <h2>Task List</h2>
          <ul>
            {tasks && tasks.map((task) => <li key={task.id}>{task.task}</li>)}
          </ul>
        </div>
      );
    }
  };

  return (
    <div>
      <Display />
    </div>
  );
}

export default Page;
