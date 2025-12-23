"use client";
import axiosClient from "@/lib/axios/axiosClient";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

const fetchNotifications = async (getToken) => {
  try {
    const token = await getToken();
    const response = await axiosClient.get("/api/v1/notifications/user", {
      headers: { Authorization: token },
      withCredentials: true,
    });
    return response.data.data;
  } catch (error) {
    console.error(error);
    toast.error("Failed to fetch notifications", {
      description: `${error.message} - ${new Date().toLocaleString()}`,
    });
  }
};

export const useFetchNotifications = () => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetchNotifications(getToken),
    staleTime: 2 * 60 * 1000,
  });
};
