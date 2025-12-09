"use client";

import { createContext, useContext, useState, useEffect } from "react";

// Create the context
const ChatSettingsContext = createContext();

export const ChatSettingsProvider = ({ children, defaultModel = null }) => {
  // Settings state
  const [model, setModel] = useState(defaultModel);
  const [isSmartContext, setIsSmartContext] = useState(false);
  const [contextWindow, setContextWindow] = useState(4);

  // Update model when defaultModel prop changes (e.g., from conversation metadata)
  useEffect(() => {
    if (defaultModel) {
      setModel(defaultModel);
    }
  }, [defaultModel]);

  const values = {
    model,
    setModel,
    isSmartContext,
    setIsSmartContext,
    contextWindow,
    setContextWindow,
    // Convenience function to get all settings as an object
    getSettings: () => ({
      model,
      isSmartContext,
      contextWindow,
    }),
    // Convenience function to update all settings at once
    updateSettings: (settings) => {
      if (settings.model !== undefined) setModel(settings.model);
      if (settings.isSmartContext !== undefined)
        setIsSmartContext(settings.isSmartContext);
      if (settings.contextWindow !== undefined)
        setContextWindow(settings.contextWindow);
    },
  };

  return (
    <ChatSettingsContext.Provider value={values}>
      {children}
    </ChatSettingsContext.Provider>
  );
};

// Export the context hook
export const useChatSettingsContext = () => {
  const context = useContext(ChatSettingsContext);
  if (!context) {
    throw new Error(
      "useChatSettingsContext must be used within a ChatSettingsProvider"
    );
  }
  return context;
};
