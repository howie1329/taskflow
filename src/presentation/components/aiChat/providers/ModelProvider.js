"use client";

import { createContext, useContext } from "react";
import {
  useFetchModelSelector,
  useModelConverter,
} from "@/hooks/ai/useFetchModelSelector";

// Create the context
const ModelContext = createContext();

export const ModelProvider = ({ children }) => {
  // Fetch models from OpenRouter
  const { data: models, isLoading: modelsLoading, error: modelsError } =
    useFetchModelSelector();

  const values = {
    models,
    modelsLoading,
    modelsError,
    // Re-export the converter hook for convenience
    useModelConverter,
  };

  return (
    <ModelContext.Provider value={values}>{children}</ModelContext.Provider>
  );
};

// Export the context hook
export const useModelContext = () => {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error("useModelContext must be used within a ModelProvider");
  }
  return context;
};
