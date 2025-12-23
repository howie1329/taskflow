"use client";
import { useFetchModelSelector } from "@/hooks/ai/useFetchModelSelector";
import { createContext, useContext, useEffect, useState } from "react";

const ChatModelContext = createContext();

export const ChatModelProvider = ({ children, defaultModel }) => {
  const [selectedModelId, setSelectedModelId] = useState(defaultModel);
  const [selectedModelName, setSelectedModelName] = useState(null);
  const { isLoading, error, data: availableModels } = useFetchModelSelector();

  useEffect(() => {
    const selectedModelName = availableModels
      ? availableModels.find((model) => model.id === selectedModelId)?.name
      : null;
    setSelectedModelName(selectedModelName);
  }, [selectedModelId, availableModels]);

  const values = {
    availableModels,
    isLoading,
    error,
    selectedModelId,
    selectedModelName,
    setSelectedModelId,
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
