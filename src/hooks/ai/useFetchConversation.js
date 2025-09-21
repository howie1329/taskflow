"use client";
import axiosClient from "@/lib/axios/axiosClient";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

const fetchConversation = async (conversationId, getToken) => {
  const token = await getToken();
  try {
    const response = await axiosClient.get(
      `/api/ai/conversation/${conversationId}`,
      {
        headers: { Authorization: token },
        withCredentials: true,
      }
    );
    toast.success("Conversation fetched successfully", {
      description: new Date().toLocaleString(),
    });
    return response.data.data[0];
  } catch (error) {
    console.error(error);
    toast.error("Failed to fetch conversation", {
      description: `${error.message} - ${new Date().toLocaleString()}`,
    });
  }
};

const useFetchConversation = (conversationId) => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => fetchConversation(conversationId, getToken),
    staleTime: 2 * 60 * 1000,
  });
};

export default useFetchConversation;
