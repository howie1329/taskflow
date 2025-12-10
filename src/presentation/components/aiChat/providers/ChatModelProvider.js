"use client";

import { useFetchModelSelector } from "@/hooks/ai/useFetchModelSelector";
import { createContext, useContext, useEffect, useState } from "react";

const ChatModelContext = createContext();

export const ChatModelProvider = ({ children, defaultModel }) => {
  const [selectedModel, setSelectedModel] = useState(defaultModel);
  const { isLoading, error, data: availableModels } = useFetchModelSelector();

  const selectedModelId = availableModels
    ? availableModels.find((model) => model.name === selectedModel)?.id
    : null;

  const values = {
    availableModels,
    isLoading,
    error,
    selectedModelId,
    selectedModel,
    setSelectedModel,
  };

  return (
    <ChatModelContext.Provider value={values}>
      {children}
    </ChatModelContext.Provider>
  );
};

export const useChatModelContext = () => {
  const context = useContext(ChatModelContext);
  if (!context) {
    throw new Error(
      "useChatModelContext must be used within a ChatModelProvider"
    );
  }
  return context;
};
