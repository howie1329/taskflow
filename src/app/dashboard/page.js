"use client";

import React, { use, useEffect, useState } from "react";
import axios from "axios";
import Loading from "../components/loading";
import Dash from "../components/dash";
import AlertDisplay from "../components/alertDisplay";

function Page() {
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(false);

  useEffect(() => {
    axios
      .get("/api/todo")
      .then((response) => {
        setTasks(response.data);
        setLoading(false);
        setAlert(true);
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

  return (
    <div>
      <h1>Task Flow - Dashboard</h1>
      {loading ? (
        <Loading />
      ) : (
        <Dash
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          addTask={addTask}
          taskArr={tasks}
        />
      )}
      <AlertDisplay alert={alert} setAlert={setAlert} />
    </div>
  );
}

export default Page;
