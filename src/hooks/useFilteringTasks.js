import { filterTasks } from "@/lib/filterTasks";
import React, { useMemo, useState } from "react";

export const useFilteringTasks = (tasks) => {
  const [status, setStatus] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState("None");

  const filteredTask = useMemo(() => {
    return filterTasks(tasks, {
      status: status,
      priorityFilter: priorityFilter,
    });
  }, [tasks, status, priorityFilter]);

  return { filteredTask, status, priorityFilter, setStatus, setPriorityFilter };
};
