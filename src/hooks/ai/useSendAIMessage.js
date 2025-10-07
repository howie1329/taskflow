"use client";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

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
      {
        id: `user-${Date.now()}`,
        content: variables.newMessage,
        role: "user",
        model: variables.model,
        settings: variables.settings,
        created_at: new Date().toISOString(),
      },
    ]);

    const res = await fetch("http://localhost:3001/api/ai/ai-chat", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    const assistantMessageId = `assistant-${Date.now()}`;
    queryClient.setQueryData(["messages", variables.conversationId], (old) => [
      ...(old || []),
      { id: assistantMessageId, content: "", role: "assistant" },
    ]);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedContent = "";
    let jsonBuffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      const parts = chunk.split("\n");

      for (const part of parts) {
        if (part.startsWith("json:")) {
          jsonBuffer += part.replace("json:", "").trim();

          try {
            const jsonResponse = JSON.parse(jsonBuffer);

            queryClient.setQueryData(
              ["messages", variables.conversationId],
              (old) => {
                if (!old) return [];

                const messages = [...old];
                const lastMessageIndex = messages.length - 1;

                if (
                  lastMessageIndex >= 0 &&
                  messages[lastMessageIndex].role === "assistant"
                ) {
                  messages[lastMessageIndex] = {
                    ...messages[lastMessageIndex],

                    content: jsonResponse.response.message,
                    ui: jsonResponse.response.data,
                    metadata: jsonResponse.response.metadata,
                  };
                }

                return messages;
              }
            );

            const newMessages = queryClient.getQueryData([
              "messages",
              variables.conversationId,
            ]);

            jsonBuffer = "";
          } catch (err) {}
        } else {
          accumulatedContent += part;

          queryClient.setQueryData(
            ["messages", variables.conversationId],
            (old) => {
              if (!old) return [];
              const messages = [...old];
              const lastMessageIndex = messages.length - 1;

              if (
                lastMessageIndex >= 0 &&
                messages[lastMessageIndex].role === "assistant"
              ) {
                messages[lastMessageIndex] = {
                  ...messages[lastMessageIndex],
                  content: accumulatedContent,
                };
              }

              return messages;
            }
          );
        }
      }
    }

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
