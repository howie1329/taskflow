"use client";
import axiosClient from "@/lib/axios/axiosClient";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

const fetchConversations = async (getToken) => {
  const token = await getToken();
  try {
    const response = await axiosClient.get("/api/ai/conversations", {
      headers: { Authorization: token },
      withCredentials: true,
    });
    toast.success("Conversations fetched successfully", {
      description: new Date().toLocaleString(),
    });
    return response.data.data;
  } catch (error) {
    console.error(error);
    toast.error("Failed to fetch conversations", {
      description: `${error.message} - ${new Date().toLocaleString()}`,
    });
  }
};

const useFetchConversations = () => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => fetchConversations(getToken),
    staleTime: 2 * 60 * 1000,
  });
};

export default useFetchConversations;
