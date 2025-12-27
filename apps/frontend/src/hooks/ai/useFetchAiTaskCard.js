"use client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import axiosClient from "@/lib/axios/axiosClient";

const fetchAiTaskCard = async (taskId, getToken) => {
  const token = await getToken();
  const response = await axiosClient.get(`/api/v1/tasks/user/${taskId}`, {
    headers: { Authorization: token },
    withCredentials: true,
  });
  return response.data.data[0];
};

const useFetchAiTaskCard = (taskId) => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["aiTaskCard", taskId],
    queryFn: () => fetchAiTaskCard(taskId, getToken),
  });
};

export default useFetchAiTaskCard;
