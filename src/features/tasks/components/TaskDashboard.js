"use client";
import React, { useState } from "react";
import { filterTasks } from "@/lib/filterTasks";
import { LoadingHorizontalTaskBoard } from "./LoadingHorizontalTaskBoard";
import VerticalTaskBoardView from "./VerticalTaskBoardView";
import { useAuth } from "@clerk/clerk-react";
import useGetTasks from "../hooks/useGetTasks";

const TaskDashboard = () => {
  const { userId } = useAuth();
  const { data: tasksData, isLoading: isTaskLoading } = useGetTasks(userId);
  const [columns] = useState([
    { id: "noDeadline", title: "No Deadline", tasks: [] },
    { id: "today", title: "Today", tasks: [] },
    { id: "thisWeek", title: "This Week", tasks: [] },
    { id: "overdue", title: "Overdue", tasks: [] },
  ]);

  const columnsWithTasks = (tasksData) => {
    if (!tasksData) return columns;
    const today = new Date().toISOString().split("T")[0];
    const isoWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const newColumns = columns.map((col) => ({ ...col, tasks: [] }));

    tasksData.forEach((task) => {
      const { date } = task;
      const noDeadline = date == null;
      const isToday = date === today;
      const isThisWeek = date >= today && date <= isoWeek;
      const isOverDue = date < today;

      if (isOverDue) {
        newColumns[3].tasks.push(task);
      } else if (noDeadline) {
        newColumns[0].tasks.push(task);
      } else if (isToday) {
        newColumns[1].tasks.push(task);
      } else if (isThisWeek) {
        newColumns[2].tasks.push(task);
      } else {
        // Default case: put in No Deadline
        newColumns[0].tasks.push(task);
      }
    });

    return newColumns;
  };
  const newColumns = columnsWithTasks(tasksData);

  if (isTaskLoading) {
    return <LoadingHorizontalTaskBoard />;
  }

  return (
    <div className="flex flex-col w-full h-screen gap-2 overflow-auto">
      <VerticalTaskBoardView newTimeGroup={newColumns} />
    </div>
  );
};

export default TaskDashboard;
