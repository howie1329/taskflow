"use client";
import { createContext, useContext, useState } from "react";

const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const [systemPromptTokens, setSystemPromptTokens] = useState(100);
  const [recentChatsTokens, setRecentChatsTokens] = useState(200);
  const [currentChatTokens, setCurrentChatTokens] = useState(300);
  const [userInfoTokens, setUserInfoTokens] = useState(300);
  const [sessionInfoTokens, setSessionInfoTokens] = useState(400);

  const values = {
    systemPromptTokens,
    recentChatsTokens,
    currentChatTokens,
    userInfoTokens,
    sessionInfoTokens,
    setSystemPromptTokens,
    setRecentChatsTokens,
    setCurrentChatTokens,
    setUserInfoTokens,
    setSessionInfoTokens,
  };

  return <ChatContext.Provider value={values}>{children}</ChatContext.Provider>;
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatContextProvider");
  }
  return context;
};
