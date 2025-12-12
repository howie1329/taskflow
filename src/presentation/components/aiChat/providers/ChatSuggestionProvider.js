"use client";
import useSuggestionMessages from "@/hooks/ai/useSuggestionMessages";
import { createContext, useContext } from "react";

const ChatSuggestionContext = createContext();

// Provider for the chat suggestion context
export const ChatSuggestionProvider = ({ children }) => {
  const { data: suggestedMessages, isLoading: suggestedMessagesLoading } =
    useSuggestionMessages();
  const values = {
    suggestedMessages,
    suggestedMessagesLoading,
  };
  return (
    <ChatSuggestionContext.Provider value={values}>
      {children}
    </ChatSuggestionContext.Provider>
  );
};

// Export the context to be used in the client
export const useChatSuggestionContext = () => {
  const context = useContext(ChatSuggestionContext);
  if (!context) {
    throw new Error(
      "useChatSuggestionContext must be used within a ChatSuggestionProvider"
    );
  }
  return context;
};
