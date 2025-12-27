"use client";
import axiosClient from "@/lib/axios/axiosClient";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

const fetchConversationMessages = async (id, getToken) => {
  const token = await getToken();
  try {
    const response = await axiosClient.get(
      `/api/v1/conversations/${id}/messages`,
      {
        headers: { Authorization: token },
        withCredentials: true,
      }
    );
    console.log("response.data.data messages", response.data.data);
    return response.data.data;
  } catch (error) {
    console.error(error);
    toast.error("Failed to fetch conversation messages", {
      description: `${error.message} - ${new Date().toLocaleString()}`,
    });
  }
};

const useFetchConversationMessages = (id, options = {}) => {
  const { getToken } = useAuth();
  const { enabled = true } = options;
  return useQuery({
    queryKey: ["messages", id],
    queryFn: () => fetchConversationMessages(id, getToken),
    staleTime: 2 * 60 * 1000,
    enabled: !!id && enabled,
  });
};

export default useFetchConversationMessages;
