"use client";
import axiosClient from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const fetchAllProjects = async (getToken) => {
  const token = await getToken();
  try {
    const response = await axiosClient.get("/api/v1/projects/user", {
      headers: { Authorization: token },
      withCredentials: true,
    });
    toast.success("Projects Fetched Successfully", {
      description: new Date().toLocaleString(),
    });
    return response.data.data;
  } catch (error) {
    console.error(error);
    toast.error("Projects Fetched Failed", {
      description: `${error.message} - ${new Date().toLocaleString()}`,
    });
  }
};

const useFetchAllProjects = () => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => fetchAllProjects(getToken),
    staleTime: 2 * 60 * 1000,
  });
};

export default useFetchAllProjects;
