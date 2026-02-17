"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";

// Placeholder hook - models system being rebuilt from scratch
export function useAIModels() {
  // This hook is temporarily stubbed out
  // Full implementation will return with new schema

  return {
    models: [],
    modelsByCategory: {},
    recommendedModels: [],
    isLoading: false,
    isEmpty: true,
    refreshModels: async () => {
      toast.info("AI model management is being rebuilt");
      return { success: true, count: 0 };
    },
  };
}
