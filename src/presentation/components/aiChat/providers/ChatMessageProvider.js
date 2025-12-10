"use client";
import useFetchConversation from "@/hooks/ai/useFetchConversation";
import useFetchConversationMessages from "@/hooks/ai/useFetchConversationMessages";
import { useChat } from "@ai-sdk/react";
import { createContext, useContext, useEffect, useState } from "react";
import { DefaultChatTransport } from "ai";
import { useAuth } from "@clerk/nextjs";

// Create the context
const ChatMessageContext = createContext();

export const ChatMessageProvider = ({ conversationId, children }) => {
  const { getToken } = useAuth();
  // Fetch conversation and messages from the database
  const { data: conversation, isLoading: conversationLoading } =
    useFetchConversation(conversationId);
  const { data: fetchedMessages, isLoading: messagesLoading } =
    useFetchConversationMessages(conversationId);

  const [defaultConversationId] = useState(
    conversationId || crypto.randomUUID().toString()
  );

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
  });

  // Set the messages from the database to the useChat hook
  useEffect(() => {
    if (fetchedMessages && fetchedMessages.length > 0) {
      setMessages(fetchedMessages);
    }
  }, [fetchedMessages, setMessages]);

  // Return the values to the context
  const values = {
    conversation,
    defaultConversationId,
    messages,
    sendMessage,
    status,
    conversationLoading,
    messagesLoading,
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
