"use client";
import React, { useState } from "react";
import { filterTasks } from "@/lib/filterTasks";
import { LoadingHorizontalTaskBoard } from "./LoadingHorizontalTaskBoard";
import VerticalTaskBoardView from "./VerticalTaskBoardView";

const TaskDashboard = ({ tasksData, status, priorityFilter, isLoading }) => {
  if (isLoading) {
    return <LoadingHorizontalTaskBoard />;
  }

  const timeGroupings = (tasksData) => {
    const today = new Date().toISOString().split("T")[0];
    const timeGroup = { NoDeadLine: [], Today: [], ThisWeek: [], OverDue: [] };

    const isoWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const filterFinal = filterTasks(tasksData, {
      status: status,
      priorityFilter: priorityFilter,
    });

    filterFinal.map((task) => {
      const { date } = task;

      const isToday = date === today;
      const isThisWeek = date >= today && date <= isoWeek;
      const isOverDue = date < today;
      const isNoDeadLine = date == null;

      // Add Upcoming

      if (isToday) {
        timeGroup.Today.push(task);
      } else if (isThisWeek) {
        timeGroup.ThisWeek.push(task);
      } else if (isOverDue) {
        timeGroup.OverDue.push(task);
      } else if (isNoDeadLine) {
        timeGroup.NoDeadLine.push(task);
      } else {
        timeGroup.NoDeadLine.push(task);
      }
    });

    return timeGroup;
  };

  const newTimeGroup = timeGroupings(tasksData);

  return (
    <div className="flex flex-col w-full h-screen gap-2 overflow-auto">
      <VerticalTaskBoardView newTimeGroup={newTimeGroup} />
    </div>
  );
};

export default TaskDashboard;
