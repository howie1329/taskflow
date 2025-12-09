"use client";

import useFetchConversation from "@/hooks/ai/useFetchConversation";
import useFetchConversationMessages from "@/hooks/ai/useFetchConversationMessages";
import { useChat } from "@ai-sdk/react";
import { createContext, useContext, useEffect } from "react";
import { DefaultChatTransport } from "ai";

// Create the context
const ChatMessageContext = createContext();

export const ChatMessageProvider = ({ conversationId, children }) => {
  // Fetch conversation and messages from the database
  const { data: conversation, isLoading: conversationLoading } =
    useFetchConversation(conversationId);
  const { data: fetchedMessages, isLoading: messagesLoading } =
    useFetchConversationMessages(conversationId);

  // Use the useChat hook to send messages to the backend
  const { messages, sendMessage, status, setMessages } = useChat({
    id: conversationId,
    transport: new DefaultChatTransport({
      api: `${process.env.NEXT_PUBLIC_API_BASE_URL}/chat`,
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
