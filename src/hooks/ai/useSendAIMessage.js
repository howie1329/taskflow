"use client";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import {
  createUserMessage,
  createThinkingMessage,
  createAssistantMessage,
  processStreamResponse,
} from "./utils/StreamingUtils";

const sendAIMessage = async (variables, getToken, queryClient) => {
  try {
    const token = await getToken();
    const requestBody = {
      conversationId: variables.conversationId,
      NewMessage: variables.newMessage,
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
      process.env.NEXT_PUBLIC_API_BASE_URL + "/api/v1/ai/ai-chat",
      {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );

    queryClient.setQueryData(["messages", variables.conversationId], (old) => [
      ...(old || []),
      createAssistantMessage(variables),
    ]);

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
      if (variables.conversationId === null || !variables.conversationId) {
        variables.conversationId = uuidv4();
      }
      router.push(`/mainview/aichat/${variables.conversationId}`);
      return sendAIMessage(variables, getToken, queryClient);
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
