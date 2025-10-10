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
        createdAt: new Date().toISOString(),
      },
    ]);

    queryClient.setQueryData(["messages", variables.conversationId], (old) => [
      ...(old || []),
      {
        id: `assistant-thinking`,
        content: "Thinking...",
        role: "Thinking",
        status: "thinking",
      },
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

    const assistantMessageId = `assistant-${Date.now()}`;
    queryClient.setQueryData(["messages", variables.conversationId], (old) => [
      ...(old || []),
      {
        id: assistantMessageId,
        content: "",
        role: "assistant",
        metadata: { timestamp: new Date().toISOString() },
      },
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

                const filteredMessages = old.filter(
                  (message) => message.id !== `assistant-thinking`
                );

                const messages = [...filteredMessages];
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

            jsonBuffer = "";
          } catch (err) {}
        } else if (part.startsWith("ToolCallStart:")) {
          console.log("ToolCallStart: ", part);
          const toolCall = JSON.parse(
            part.replace("ToolCallStart:", "").trim()
          );

          const tool_call_start_message = {
            id: toolCall.call_id,
            content: `${toolCall.name} has started`,
            role: "tool",
            status: "started",
          };

          queryClient.setQueryData(
            ["messages", variables.conversationId],
            (old) => {
              if (!old) return [];
              const old_messages = [...old];
              const last_message_index = old_messages.length - 1;
              const last_message = old_messages[last_message_index];

              const sliced_messages = old_messages.slice(0, last_message_index);
              sliced_messages.push(tool_call_start_message);
              sliced_messages.push(last_message);
              return sliced_messages;
            }
          );
        } else if (part.startsWith("ToolCallEnd:")) {
          console.log("ToolCallEnd: ", part);
          const toolCall = JSON.parse(part.replace("ToolCallEnd:", "").trim());

          const tool_call_end_message = {
            id: toolCall.call_id,
            content: `${toolCall.name} has ended`,
            role: "tool",
            status: "completed",
          };

          queryClient.setQueryData(
            ["messages", variables.conversationId],
            (old) => {
              if (!old) return [];
              const old_messages = [...old];
              const tool_call_message = old_messages.find(
                (message) => message.id === tool_call_end_message.id
              );
              if (tool_call_message) {
                tool_call_message.status = tool_call_end_message.status;
                tool_call_message.content = tool_call_end_message.content;
              }
              return old_messages;
            }
          );
        } else if (!part.startsWith("json:")) {
          accumulatedContent += part;

          queryClient.setQueryData(
            ["messages", variables.conversationId],
            (old) => {
              if (!old) return [];

              const filteredMessages = old.filter(
                (message) => message.id !== `assistant-thinking`
              );
              const messages = [...filteredMessages];
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
