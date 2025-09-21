"use client";
import axiosClient from "@/lib/axios/axiosClient";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

const fetchConversationMessages = async (id, getToken) => {
  const token = await getToken();
  try {
    const response = await axiosClient.get(`/api/ai/messages/${id}`, {
      headers: { Authorization: token },
      withCredentials: true,
    });
    toast.success("Conversation messages fetched successfully", {
      description: new Date().toLocaleString(),
    });
    return response.data.data;
  } catch (error) {
    console.error(error);
    toast.error("Failed to fetch conversation messages", {
      description: `${error.message} - ${new Date().toLocaleString()}`,
    });
  }
};

const useFetchConversationMessages = (id) => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["messages", id],
    queryFn: () => fetchConversationMessages(id, getToken),
    staleTime: 2 * 60 * 1000,
  });
};

export default useFetchConversationMessages;
