"use client";
import axiosClient from "@/lib/axios/axiosClient";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

const fetchConversation = async (conversationId, getToken) => {
  const token = await getToken();
  try {
    const response = await axiosClient.get(
      `/api/v1/conversations/${conversationId}`,
      {
        headers: { Authorization: token },
        withCredentials: true,
      }
    );
    console.log("response.data.data[0]", response.data.data);
    return response.data.data;
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
