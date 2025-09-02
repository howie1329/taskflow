"use client";
import axiosClient from "@/lib/axios/axiosClient";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const fetchTaskSubtask = async (taskId) => {
  try {
    const response = await axiosClient.get(`/api/tasks/subtasks/${taskId}`);
    console.log("Response: ", response.data.data);
    return response.data.data;
  } catch (error) {
    toast.error("Failed to fetch task subtasks", {
      description: `${error.message} - ${new Date().toLocaleString()}`,
    });
    console.error(error);
    return [];
  }
};

const useFetchTaskSubtask = (taskId) => {
  return useQuery({
    queryKey: ["subtasks", taskId],
    queryFn: () => fetchTaskSubtask(taskId),
    staleTime: 60 * 10000,
    enabled: !!taskId,
  });
};

export { fetchTaskSubtask, useFetchTaskSubtask };
