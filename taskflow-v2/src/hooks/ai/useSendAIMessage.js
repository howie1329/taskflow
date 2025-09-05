"use client";
import axiosClient from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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

  console.log("response in sendAIMessage", response);

  return response.data;
};

const useSendAIMessage = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (variables) => {
      // TODO: Append the new message to the chat history... optimistic update
      return sendAIMessage(variables, getToken);
    },
    onSuccess: (data, variables) => {
      console.log("data in onSuccess", data.data.conversation_id);
      console.log("variables in onSuccess", variables);

      if (!variables.conversationId) {
        queryClient.invalidateQueries({
          queryKey: ["conversations"],
        });
        router.push(`/mainview/aichat/${data.data.conversation_id}`);
      } else {
        queryClient.invalidateQueries({
          queryKey: ["conversation", variables.conversationId],
        });
      }

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
