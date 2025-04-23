"use client";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "@/lib/axiosClient";
import { useAuth } from "@clerk/nextjs";

const singleSubTask = async (id, getToken) => {
  const token = await getToken();
  try {
    console.log("Running PreFetch: ");
    const response = await axiosClient.get(`/api/tasks/subtasks/${id}`, {
      headers: { Authorization: token },
      withCredentials: true,
    });
    return response.data.subtasks;
  } catch (error) {
    console.error(error);
  }
};

const useFetchSingleSubTask = (taskId) => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["subtasks", taskId],
    queryFn: () => singleSubTask(taskId, getToken),
    staleTime: 60 * 10000,
    enabled: !!taskId,
  });
};

export { useFetchSingleSubTask, singleSubTask };
