"use client";

import useFetchConversations from "@/hooks/ai/useFetchConversations";
import { createContext, useContext } from "react";

const ChatHistoryContext = createContext();

export const ChatHistoryProvider = ({ children }) => {
  const { data: conversations, isLoading: conversationsLoading } =
    useFetchConversations();
  const values = {
    conversations,
    conversationsLoading,
  };
  return (
    <ChatHistoryContext.Provider value={values}>
      {children}
    </ChatHistoryContext.Provider>
  );
};

export const useChatHistoryContext = () => {
  const context = useContext(ChatHistoryContext);
  if (!context) {
    throw new Error(
      "useChatHistoryContext must be used within a ChatHistoryProvider"
    );
  }
  return context;
};
