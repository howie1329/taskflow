"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export function useViewer() {
  const viewer = useQuery(api.users.getViewer);
  const ensureInitialized = useMutation(api.users.ensureViewerInitialized);

  // Auto-initialize user docs when viewer loads without profile/preferences
  useEffect(() => {
    if (viewer && viewer.userId && (!viewer.profile || !viewer.preferences)) {
      ensureInitialized();
    }
  }, [viewer, ensureInitialized]);

  const isLoading = viewer === undefined;
  const isAuthenticated = !!viewer?.userId;

  // Build display values (profile takes precedence over identity)
  const displayValues = {
    firstName: viewer?.profile?.firstName || "",
    lastName: viewer?.profile?.lastName || "",
    email: viewer?.profile?.email || viewer?.identityEmail || "",
  };

  return {
    viewer,
    isLoading,
    isAuthenticated,
    displayValues,
    userId: viewer?.userId || null,
    profile: viewer?.profile || null,
    preferences: viewer?.preferences || null,
    identityEmail: viewer?.identityEmail || null,
    identityName: viewer?.identityName || null,
  };
}
