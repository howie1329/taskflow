"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useChatMessageContext } from "./ChatMessageProvider";

const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const { messages } = useChatMessageContext();
  const [systemPromptTokens, setSystemPromptTokens] = useState(100);
  const [recentChatsTokens, setRecentChatsTokens] = useState(200);
  const [currentChatTokens, setCurrentChatTokens] = useState(300);
  const [userInfoTokens, setUserInfoTokens] = useState(300);
  const [sessionInfoTokens, setSessionInfoTokens] = useState(400);

  useEffect(() => {
    const tempContextTokens = contextTokensCollector(messages);
    setSystemPromptTokens(tempContextTokens.SystemPromptTokens);
    setRecentChatsTokens(tempContextTokens.RecentChatsTokens);
    setCurrentChatTokens(tempContextTokens.CurrentChatTokens);
    setUserInfoTokens(tempContextTokens.UserInfoTokens);
    setSessionInfoTokens(tempContextTokens.SessionInfoTokens);
  }, [messages]);

  const values = {
    systemPromptTokens,
    recentChatsTokens,
    currentChatTokens,
    userInfoTokens,
    sessionInfoTokens,
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

export const contextTokensCollector = (messages) => {
  let tempData = null;
  let tempContextTokens = {
    SystemPromptTokens: 0,
    RecentChatsTokens: 0,
    CurrentChatTokens: 0,
    UserInfoTokens: 0,
    SessionInfoTokens: 0,
  };

  messages.forEach((message) => {
    tempData = message.metadata?.contextTokens;
    if (tempData) {
      tempContextTokens.SystemPromptTokens = tempData.SystemPromptTokens;
      tempContextTokens.RecentChatsTokens = tempData.RecentChatsTokens;
      tempContextTokens.CurrentChatTokens = tempData.CurrentChatTokens;
      tempContextTokens.UserInfoTokens = tempData.UserInfoTokens;
      tempContextTokens.SessionInfoTokens = tempData.SessionInfoTokens;
    }
  });
  console.log("Temp Context Tokens", tempContextTokens);
  return tempContextTokens;
};
