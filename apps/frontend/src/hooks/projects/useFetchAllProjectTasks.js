"use client";
import axiosClient from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const fetchAllProjectTasks = async (projectId, getToken) => {
  const token = await getToken();
  try {
    const response = await axiosClient.get(
      `/api/v1/tasks/project/${projectId}`,
      {
        headers: { Authorization: token },
        withCredentials: true,
      }
    );
    toast.success("All project tasks fetched successfully", {
      description: new Date().toLocaleString(),
    });
    return response.data.data;
  } catch (error) {
    console.error(error);
    toast.error("Failed to fetch all project tasks", {
      description: `${error.message} - ${new Date().toLocaleString()}`,
    });
  }
};

const useFetchAllProjectTasks = (projectId) => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["projectTasks", projectId],
    queryFn: () => fetchAllProjectTasks(projectId, getToken),
    staleTime: 2 * 60 * 1000,
  });
};

export default useFetchAllProjectTasks;
