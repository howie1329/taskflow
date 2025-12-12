"use client";
import useFetchConversation from "@/hooks/ai/useFetchConversation";
import useFetchConversationMessages from "@/hooks/ai/useFetchConversationMessages";
import { useChat } from "@ai-sdk/react";
import { createContext, useContext, useEffect, useState } from "react";
import { DefaultChatTransport } from "ai";
import { useAuth } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";

// Create the context
const ChatMessageContext = createContext();

export const ChatMessageProvider = ({ conversationId, children }) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  // Fetch conversation and messages from the database
  const [defaultConversationId] = useState(
    conversationId || crypto.randomUUID().toString()
  );
  const { data: conversation, isLoading: conversationLoading } =
    useFetchConversation(conversationId);
  const { data: fetchedMessages, isLoading: messagesLoading } =
    useFetchConversationMessages(conversationId);

  const [toolArtifacts, setToolArtifacts] = useState([]);

  // Use the useChat hook to send messages to the backend
  const { messages, sendMessage, status, setMessages } = useChat({
    id: defaultConversationId, // If no conversationId is provided, use null might need to set to a default value
    transport: new DefaultChatTransport({
      api: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/conversations/${defaultConversationId}/messages`,
      headers: async () => {
        const token = await getToken();
        return {
          Authorization: token,
        };
      },
      body: {
        conversationId: defaultConversationId,
      },
    }),
    onToolCall: (toolCall) => {
      console.log("Inside useChat onToolCallHook", toolCall);
    },
    onData: (data) => {
      console.log("Inside useChat onDataHook", data);
    },
  });

  // Set the messages from the database to the useChat hook
  useEffect(() => {
    if (fetchedMessages && fetchedMessages.length > 0) {
      setMessages(fetchedMessages);
    }
  }, [fetchedMessages, setMessages]);

  // Collect Tool Artifacts from the useChat Hook
  useEffect(() => {
    console.log("Messages", messages);
    const tempToolArtifacts = [];
    messages.forEach((message) => {
      message.parts.forEach((part) => {
        if (part.type?.startsWith("data-artifact-")) {
          tempToolArtifacts.push(part.data);
        }
      });
    });
    setToolArtifacts(tempToolArtifacts);
    console.log("Temp Tool Artifacts", tempToolArtifacts);
  }, [messages]);

  // Update the conversation title on messsages receive
  useEffect(() => {
    if (!conversation?.title && messages.length > 0) {
      queryClient.refetchQueries({
        queryKey: ["conversation", defaultConversationId],
      });
    }
  }, [messages, queryClient, defaultConversationId, conversation]);

  // Return the values to the context
  const values = {
    conversation,
    defaultConversationId,
    messages,
    sendMessage,
    status,
    conversationLoading,
    messagesLoading,
    toolArtifacts,
  };
  return (
    <ChatMessageContext.Provider value={values}>
      {children}
    </ChatMessageContext.Provider>
  );
};

// Export the context to be used in the client
export const useChatMessageContext = () => {
  const context = useContext(ChatMessageContext);
  if (!context) {
    throw new Error(
      "useChatMessageContext must be used within a ChatMessageProvider"
    );
  }
  return context;
};
