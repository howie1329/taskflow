"use client";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const singleSubTask = async (id) => {
  try {
    const response = await axios.get(`/api/task/subtask/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const useFetchSingleSubTask = (taskId) => {
  return useQuery({
    queryKey: ["subtasks", taskId],
    queryFn: () => singleSubTask(taskId),
    staleTime: 60 * 10000,
    enabled: !!taskId,
  });
};

export { useFetchSingleSubTask, singleSubTask };
