"use client";
import axiosClient from "@/lib/axios/axiosClient";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
const fetchTaskSubtask = async (taskId, getToken) => {
  const token = await getToken();
  try {
    const response = await axiosClient.get(`/api/tasks/subtasks/${taskId}`, {
      headers: { Authorization: token },
      withCredentials: true,
    });
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

const useFetchTaskSubtask = (taskId, isOpen = true) => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["subtasks", taskId],
    queryFn: () => fetchTaskSubtask(taskId, getToken),
    staleTime: 60 * 10000,
    enabled: !!taskId && isOpen,
  });
};

export { fetchTaskSubtask, useFetchTaskSubtask };
