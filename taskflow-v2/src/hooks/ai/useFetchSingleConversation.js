"use client";
import axiosClient from "@/lib/axios/axiosClient";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

const fetchSingleConversation = async (id, getToken) => {
  const token = await getToken();
  try {
    const response = await axiosClient.get(`/api/ai/conversations/${id}`, {
      headers: { Authorization: token },
      withCredentials: true,
    });
    toast.success("Single conversation fetched successfully", {
      description: new Date().toLocaleString(),
    });
    return response.data.data;
  } catch (error) {
    console.error(error);
    toast.error("Failed to fetch single conversation", {
      description: `${error.message} - ${new Date().toLocaleString()}`,
    });
  }
};

const useFetchSingleConversation = (id) => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["conversation", id],
    queryFn: () => fetchSingleConversation(id, getToken),
    staleTime: 2 * 60 * 1000,
  });
};

export default useFetchSingleConversation;
