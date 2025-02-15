"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Loading from "../components/loading";
import Dash from "../components/dash";
import { useToast } from "@/hooks/use-toast";

function Page() {
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    axios
      .get("/api/todo")
      .then((response) => {
        setTasks(response.data);
        setLoading(false);
        toast({
          title: "Task Flow",
          description: "Your tasks has been loaded successfully.",
        });
      })
      .catch((error) => {
        toast({
          variant: "error",
          title: "Task Flow",
          description: "Failed to load tasks.",
        });
        console.log(error);
      });
  }, []);

  return (
    <div className="flex m-2 flex-col items-center h-screen">
      <h1 className="font-bold text-2xl">Task Flow - Dashboard</h1>
      {loading ? (
        <Loading />
      ) : (
        <Dash
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          taskArr={tasks}
        />
      )}
    </div>
  );
}

export default Page;
