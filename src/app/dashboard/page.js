"use client";
import React, { useState } from "react";
import Loading from "../components/loading";
import Dash from "../features/tasks/components/dash";
import useGetTasks from "@/hooks/useGetTasks";

function Page() {
  const [refresh, setRefresh] = useState(false);
  const { tasks, loading } = useGetTasks("/api/todo", refresh);

  return (
    <div className="flex m-2 flex-col items-center h-screen">
      <h1 className="font-bold text-2xl">Task Flow - Dashboard</h1>
      {loading ? (
        <Loading />
      ) : (
        <Dash taskArr={tasks} setRefresh={setRefresh} refresh={refresh} />
      )}
    </div>
  );
}

export default Page;
