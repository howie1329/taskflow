"use client";
import axiosClient from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
const fetchSingleProject = async (projectId, getToken) => {
  const token = await getToken();
  try {
    const response = await axiosClient.get(`/api/v1/projects/${projectId}`, {
      headers: { Authorization: token },
      withCredentials: true,
    });
    toast.success("Project fetched successfully", {
      description: new Date().toLocaleString(),
    });
    return response.data.data;
  } catch (error) {
    console.error(error);
    toast.error("Failed to fetch project", {
      description: `${error.message} - ${new Date().toLocaleString()}`,
    });
  }
};

const useFetchSingleProject = (projectId) => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchSingleProject(projectId, getToken),
    staleTime: 2 * 60 * 1000,
  });
};

export default useFetchSingleProject;
