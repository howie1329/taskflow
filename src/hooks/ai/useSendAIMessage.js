"use client";
import axiosClient from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const sendAIMessage = async (message, getToken) => {
  const token = await getToken();

  const response = await axiosClient.post(
    "/api/ai/ai-chat",
    {
      NewMessage: message.newMessage,
      conversationId: message.conversationId,
      model: message.model,
    },
    {
      headers: { Authorization: token },
      withCredentials: true,
    }
  );

  console.log("AI Response", response.data.data);

  return response.data.data;
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
    onMutate: async (variables) => {
      if (variables.conversationId) {
        await queryClient.cancelQueries({
          queryKey: ["conversation", variables.conversationId],
        });

        const previousConversations = queryClient.getQueryData([
          "conversation",
          variables.conversationId,
        ]);
        queryClient.setQueryData(
          ["conversation", variables.conversationId],
          (old) => [
            ...old,
            {
              id: "temp-" + Date.now(),
              content: variables.newMessage,
              role: "user",
              created_at: new Date().toISOString(),
            },
          ]
        );
        return { previousConversations };
      }
    },
    onSuccess: (data, variables) => {
      if (!variables.conversationId) {
        router.push(`/mainview/aichat/${data.conversation_id}`);
      }

      toast.success("Message sent successfully", {
        description: new Date().toLocaleString(),
      });
    },
    onSettled: (data, error, variables, context) => {
      if (variables.conversationId) {
        queryClient.invalidateQueries({
          queryKey: ["conversation", variables.conversationId],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: ["conversations"],
        });
      }
    },
    onError: (error, variables, context) => {
      if (context.previousConversations) {
        if (variables.conversationId) {
          queryClient.setQueryData(
            ["conversation", variables.conversationId],
            context.previousConversations
          );
        }
      }
      console.error("onError fired:", error);
      toast.error("Failed to send message", {
        description: `${error.message} - ${new Date().toLocaleString()}`,
      });
    },
  });
};

export default useSendAIMessage;
