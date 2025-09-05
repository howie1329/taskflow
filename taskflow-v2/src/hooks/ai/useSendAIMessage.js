"use client";
import axiosClient from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const sendAIMessage = async (message, getToken) => {
  const token = await getToken();
  console.log("message in sendAIMessage", message);

  const response = await axiosClient.post(
    "/api/ai/traditional-ai",
    {
      NewMessage: message.newMessage,
      conversationId: message.conversationId,
    },
    {
      headers: { Authorization: token },
      withCredentials: true,
    }
  );

  return response.data;
};

const useSendAIMessage = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables) => {
      console.log("message in useSendAIMessage", variables.newMessage);
      console.log("id", variables.conversationId);
      return sendAIMessage(variables, getToken);
    },
    onSuccess: (data, variables) => {
      console.log("onSuccess fired with data:", data);
      console.log("onSuccess fired with variables:", variables);

      queryClient.invalidateQueries({
        queryKey: ["conversation", variables.conversationId],
      });

      toast.success("Message sent successfully", {
        description: new Date().toLocaleString(),
      });
    },
    onError: (error, variables) => {
      console.error("onError fired:", error);
      toast.error("Failed to send message", {
        description: `${error.message} - ${new Date().toLocaleString()}`,
      });
    },
  });
};

export default useSendAIMessage;
