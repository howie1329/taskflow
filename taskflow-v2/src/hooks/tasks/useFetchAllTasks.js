"use client";
import axiosClient from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

const fetchAllTasks = async (getToken) => {
  const token = await getToken();
  try {
    const response = await axiosClient.get("/api/tasks/user", {
      headers: { Authorization: token },
      withCredentials: true,
    });
    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    console.error(error);
  }
};

const useFetchAllTasks = () => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["tasks"],
    queryFn: () => fetchAllTasks(getToken),
    staleTime: 2 * 60 * 1000,
  });
};

export default useFetchAllTasks;
