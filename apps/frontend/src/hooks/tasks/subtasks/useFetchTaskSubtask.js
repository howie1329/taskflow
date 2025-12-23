"use client";
import axiosClient from "@/lib/axios/axiosClient";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";

const fetchTaskSubtask = async (taskId, getToken) => {
  const token = await getToken();
  const response = await axiosClient.get(`/api/v1/tasks/subtasks/${taskId}`, {
    headers: { Authorization: token },
    withCredentials: true,
  });
  return response.data.data;
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

export { useFetchTaskSubtask, fetchTaskSubtask };
