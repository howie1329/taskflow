"use client";
import { useSockets } from "@/lib/sockets/useSockets";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

const sendAIMessage = async (message, queryClient, socket, userId) => {
  console.log("Message: ", message);
  return new Promise((resolve, reject) => {
    let fullTextResponse = "";
    let jsonResponse = null;
    const handleChat = (data) => {
      console.log("Data: ", data);
      if (data.type === "start") {
        toast.success("AI Chat Started", {
          description: new Date().toLocaleString(),
        });
      }

      if (data.type === "text") {
        fullTextResponse += data.text;
        queryClient.setQueryData(["messages", data.conversationId], (old) => {
          const existingMessages = old || [];
          const lastMessage = existingMessages[existingMessages.length - 1];
          if (lastMessage && lastMessage.role === "assistant") {
            return [
              ...existingMessages.slice(0, -1),
              {
                ...lastMessage,
                content: fullTextResponse,
                role: "assistant",
              },
            ];
          } else {
            return [
              ...existingMessages,
              {
                id: data.conversationId,
                content: fullTextResponse,
                role: "assistant",
              },
            ];
          }
        });
      }

      if (data.type === "done") {
        toast.success("AI Chat Done", {
          description: new Date().toLocaleString(),
        });
        // TODO: Optimistic update the ai message json response

        queryClient.setQueryData(["messages", data.conversationId], (old) => {
          const existingMessages = old || [];
          const lastMessage = existingMessages[existingMessages.length - 1];
          return [
            ...existingMessages.slice(0, -1),
            {
              ...lastMessage,
              data: data.response.response.data,
              metadata: data.response.response.metadata,
              role: "assistant",
            },
          ];
        });

        // queryClient.invalidateQueries({
        //   queryKey: ["messages", data.conversationId],
        // });

        jsonResponse = data.response.response;
        socket.off("ai-traditional-chat", handleChat);
        resolve(jsonResponse);
      }
    };

    socket.on("ai-traditional-chat", handleChat);

    socket.emit("ai-traditional-chat", {
      userId: userId,
      conversationId: message.conversationId,
      model: message.model,
      message: message.newMessage,
      settings: message.settings,
    });
  });
};

const useSendAIMessage = () => {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { socket } = useSockets();
  return useMutation({
    mutationFn: async (variables) => {
      console.log("Variables 1: ", variables);

      if (variables.conversationId === null || !variables.conversationId) {
        variables.conversationId = uuidv4();
      }

      socket.emit("join-chat", {
        conversationId: variables.conversationId,
      });

      router.push(`/mainview/aichat/${variables.conversationId}`);

      console.log("Variables 2: ", variables);
      // TODO: Append the new message to the chat history... optimistic update
      return sendAIMessage(variables, queryClient, socket, userId);
    },
    onMutate: async (variables) => {
      console.log("On Mutate: ", variables);
      if (variables.conversationId) {
        await queryClient.cancelQueries({
          queryKey: ["messages", variables.conversationId],
        });

        const previousConversations = queryClient.getQueryData([
          "messages",
          variables.conversationId,
        ]);
        queryClient.setQueryData(
          ["messages", variables.conversationId],
          (old) => [
            ...old,
            {
              id: variables.conversationId,
              content: variables.newMessage,
              role: "user",
              model: variables.model,
              created_at: new Date().toISOString(),
            },
          ]
        );
        return { previousConversations };
      }
    },
    onSuccess: (data, variables) => {
      toast.success("Message sent successfully", {
        description: new Date().toLocaleString(),
      });
    },
    onSettled: (data, error, variables, context) => {
      if (!variables.conversationId || variables.conversationId === null) {
        console.log("On Settled: ", data, error, variables, context);
        //router.push(`/mainview/aichat/${variables.conversationId}`);
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
