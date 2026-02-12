"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMemo } from "react";

export interface AvailableModel {
  _id: string;
  _creationTime: number;
  modelId: string;
  canonicalSlug?: string;
  provider?: string;
  name: string;
  description: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  contextLength?: number;
  maxCompletionTokens?: number;
  modality?: string;
  inputModalities?: string[];
  outputModalities?: string[];
  supportedParameters?: string[];
  syncedAt: number;
}

export function useAvailableModels() {
  const models = useQuery(api.models.getAvailableModels) as
    | AvailableModel[]
    | undefined;

  const modelsSorted = useMemo(() => {
    if (!models) return [];
    return [...models].sort((a, b) => a.name.localeCompare(b.name));
  }, [models]);

  const lastSyncedAt = useMemo(() => {
    if (!models || models.length === 0) return null;
    return Math.max(...models.map((m) => m.syncedAt));
  }, [models]);

  const isLoading = models === undefined;
  const isEmpty = !isLoading && models.length === 0;

  return {
    models: modelsSorted,
    isLoading,
    isEmpty,
    lastSyncedAt,
    count: models?.length ?? 0,
  };
}
