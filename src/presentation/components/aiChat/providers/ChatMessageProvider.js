"use client";

import useFetchConversation from "@/hooks/ai/useFetchConversation";
import useFetchConversationMessages from "@/hooks/ai/useFetchConversationMessages";
import { createContext, useContext } from "react";

const ChatMessageContext = createContext();

export const ChatMessageProvider = ({ conversationId, children }) => {
  const { data: conversation, isLoading: conversationLoading } =
    useFetchConversation(conversationId);
  const { data: messages, isLoading: messagesLoading } =
    useFetchConversationMessages(conversationId);

  const values = {
    conversation,
    messages,
    conversationLoading,
    messagesLoading,
  };
  return (
    <ChatMessageContext.Provider value={values}>
      {children}
    </ChatMessageContext.Provider>
  );
};

export const useChatMessageContext = () => {
  const context = useContext(ChatMessageContext);
  if (!context) {
    throw new Error(
      "useChatMessageContext must be used within a ChatMessageProvider"
    );
  }
  return context;
};
