"use client";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createUserMessage,
  createThinkingMessage,
  createAssistantMessage,
  processStreamResponse,
} from "./utils/StreamingUtils";
import axiosClient from "@/lib/axios/axiosClient";

const sendAIMessage = async (variables, getToken, queryClient, router) => {
  // Checking if conversationId is provided
  if (variables.conversationId === null || !variables.conversationId) {
    const token = await getToken();
    const response = await axiosClient.post(
      "/api/v1/conversations/create",
      {
        message: variables.newMessage,
      },
      {
        headers: {
          Authorization: token,
        },
        withCredentials: true,
      }
    );
    variables.conversationId = response.data.data.id;
    router.push(`/mainview/aichat/${variables.conversationId}`);
  }
  // Send message to backend
  try {
    const token = await getToken();
    const requestBody = {
      message: variables.newMessage,
      model: variables.model,
      settings: variables.settings,
    };

    queryClient.setQueryData(["messages", variables.conversationId], (old) => [
      ...(old || []),
      createUserMessage(variables),
    ]);

    queryClient.setQueryData(["messages", variables.conversationId], (old) => [
      ...(old || []),
      createThinkingMessage(),
    ]);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/conversations/${variables.conversationId}/messages`,
      {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: { Authorization: token, "Content-Type": "application/json" },
        withCredentials: true,
      }
    );

    // i will not use this because i will update the message with the id not the index
    // queryClient.setQueryData(["messages", variables.conversationId], (old) => [
    //   ...(old || []),
    //   createAssistantMessage(variables),
    // ]);

    // Processing stream response
    await processStreamResponse(res, queryClient, variables.conversationId);

    return res;
  } catch (error) {
    console.error(error);
    toast.error("Failed to send message", {
      description: `${error.message} - ${new Date().toLocaleString()}`,
    });
    throw error;
  }
};

const useSendAIMessage = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async (variables) => {
      return sendAIMessage(variables, getToken, queryClient, router);
    },
    onMutate: async (variables) => {
      if (variables.conversationId) {
        await queryClient.cancelQueries({
          queryKey: ["messages", variables.conversationId],
        });

        const previousConversations = queryClient.getQueryData([
          "messages",
          variables.conversationId,
        ]);

        return { previousConversations };
      }
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
    onError: (error, variables, context) => {
      if (context.previousConversations) {
        if (variables.conversationId) {
          queryClient.setQueryData(
            ["messages", variables.conversationId],
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
