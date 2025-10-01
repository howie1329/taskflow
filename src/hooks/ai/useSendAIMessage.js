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

    const res = await fetch("http://localhost:3001/api/ai/ai-chat", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    // Add user message
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

    // Add assistant placeholder
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
      console.log("Chunk: ", chunk);

      // Split on newlines, since server may send structured "events"
      const parts = chunk.split("\n");

      for (const part of parts) {
        if (part.startsWith("json:")) {
          // Append JSON fragment to buffer
          jsonBuffer += part.replace("json:", "").trim();

          try {
            // Try parse
            const jsonResponse = JSON.parse(jsonBuffer);
            console.log("✅ Parsed JSON Response:", jsonResponse.response);

            // Update last assistant message with JSON response
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
                    // replace text with clean message
                    ui: jsonResponse.response.data, // structured UI data
                    metadata: jsonResponse.response.metadata, // adjust to your shape,
                  };
                }

                return messages;
              }
            );

            const newMessages = queryClient.getQueryData([
              "messages",
              variables.conversationId,
            ]);
            console.log("New Messages: ", newMessages);

            // Reset buffer after successful parse
            jsonBuffer = "";
          } catch (err) {
            // JSON not complete yet → keep buffering
          }
        } else {
          // Normal text chunk
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

    console.log("Streaming complete");
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
