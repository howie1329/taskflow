"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { useAvailableModels } from "../hooks/use-available-models";
import { useViewer } from "../hooks/use-viewer";
import { toast } from "sonner";

export function AITab() {
  const { models, isLoading, isEmpty, lastSyncedAt, count } =
    useAvailableModels();
  const { preferences } = useViewer();
  const usage = useQuery(api.usage.getMyChatUsage);
  const updatePreferences = useMutation(api.preferences.updateMyPreferences);

  const [showActions, setShowActions] = useState(true);
  const [showToolDetails, setShowToolDetails] = useState(true);
  const [showReasoning, setShowReasoning] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (preferences) {
      if (preferences.aiChatShowActions !== undefined) {
        setShowActions(preferences.aiChatShowActions);
      }
      if (preferences.aiChatShowToolDetails !== undefined) {
        setShowToolDetails(preferences.aiChatShowToolDetails);
      }
      if (preferences.aiChatShowReasoning !== undefined) {
        setShowReasoning(preferences.aiChatShowReasoning);
      }
    }
  }, [preferences]);

  const handleShowActionsChange = async (value: boolean) => {
    setShowActions(value);
    if (!value) {
      setShowToolDetails(false);
    }
    setIsSaving(true);
    try {
      await updatePreferences({
        aiChatShowActions: value,
        aiChatShowToolDetails: value ? undefined : false,
      });
      toast.success("Settings updated");
    } catch {
      toast.error("Failed to update settings");
      setShowActions(!value);
      setShowToolDetails(!value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShowToolDetailsChange = async (value: boolean) => {
    setShowToolDetails(value);
    setIsSaving(true);
    try {
      await updatePreferences({ aiChatShowToolDetails: value });
      toast.success("Settings updated");
    } catch {
      toast.error("Failed to update settings");
      setShowToolDetails(!value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShowReasoningChange = async (value: boolean) => {
    setShowReasoning(value);
    setIsSaving(true);
    try {
      await updatePreferences({ aiChatShowReasoning: value });
      toast.success("Settings updated");
    } catch {
      toast.error("Failed to update settings");
      setShowReasoning(!value);
    } finally {
      setIsSaving(false);
    }
  };

  const currentDefaultModelId = preferences?.defaultAIModel?.modelId;

  const formatSyncTime = (timestamp: number | null) => {
    if (!timestamp) return "Never";
    return new Date(timestamp).toLocaleString();
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (isNaN(num)) return "$0.00";
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="space-y-8 divide-y divide-border/60">
      <section className="space-y-4 pb-8">
        <div className="space-y-2">
          <h2 className="text-base font-medium">Usage</h2>
          <p className="text-sm text-muted-foreground">
            Basic chat activity for your account.
          </p>
        </div>

        {usage === undefined ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-5 w-48" />
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              Messages sent today (UTC):{" "}
              <span className="font-medium text-foreground">
                {usage?.messagesSentToday ?? 0}
              </span>
            </p>
            <p className="text-muted-foreground">
              Total messages sent:{" "}
              <span className="font-medium text-foreground">
                {usage?.messagesSentTotal ?? 0}
              </span>
            </p>
          </div>
        )}
      </section>

      <section className="space-y-6 py-8">
        <div className="space-y-2">
          <h2 className="text-base font-medium">AI Chat</h2>
          <p className="text-sm text-muted-foreground">
            Control what the assistant shows while it works.
          </p>
        </div>

        <div className="space-y-4">
          <Field>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <FieldLabel>Show actions</FieldLabel>
                <FieldDescription>
                  A short timeline of what the assistant is doing.
                </FieldDescription>
              </div>
              {isLoading ? (
                <Skeleton className="h-6 w-10" />
              ) : (
                <Switch
                  checked={showActions}
                  onCheckedChange={handleShowActionsChange}
                  disabled={isSaving}
                  aria-label="Show actions in chat"
                />
              )}
            </div>
          </Field>

          <Field>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <FieldLabel>Show tool details</FieldLabel>
                <FieldDescription>
                  Expandable results like sources and outcomes.
                </FieldDescription>
              </div>
              {isLoading ? (
                <Skeleton className="h-6 w-10" />
              ) : (
                <Switch
                  checked={showToolDetails}
                  onCheckedChange={handleShowToolDetailsChange}
                  disabled={isSaving || !showActions}
                  aria-label="Show tool details in chat"
                />
              )}
            </div>
          </Field>

          <Field>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <FieldLabel>Show reasoning</FieldLabel>
                <FieldDescription>
                  Optional thinking text (always collapsed by default).
                </FieldDescription>
              </div>
              {isLoading ? (
                <Skeleton className="h-6 w-10" />
              ) : (
                <Switch
                  checked={showReasoning}
                  onCheckedChange={handleShowReasoningChange}
                  disabled={isSaving}
                  aria-label="Show reasoning in chat"
                />
              )}
            </div>
          </Field>
        </div>
      </section>

      <section className="space-y-6 pt-8">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium">AI Model Settings</h2>
            {isLoading ? (
              <Skeleton className="h-5 w-24" />
            ) : (
              <Badge variant="secondary">{count} models available</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Browse available AI models and their pricing. Models sync
            automatically every 6 hours.
          </p>
          {!isLoading && (
            <p className="text-xs text-muted-foreground">
              Last synced: {formatSyncTime(lastSyncedAt)}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-64" />
                </div>
              ))}
            </>
          ) : isEmpty ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No models available yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Models will appear here after the next sync (every 6 hours)
              </p>
            </div>
          ) : (
            models.map((model) => {
              const isSelected = model.modelId === currentDefaultModelId;
              return (
                <div
                  key={model.modelId}
                  className={`space-y-3 rounded-lg border p-4 ${
                    isSelected ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{model.name}</span>
                        {isSelected && <Badge variant="default">Selected</Badge>}
                      </div>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        {model.modelId}
                      </code>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {model.description}
                  </p>

                  <div className="flex flex-wrap gap-4 border-t pt-2 text-xs text-muted-foreground">
                    <span>
                      <span className="font-medium">Input:</span>{" "}
                      {formatPrice(model.pricing.prompt)} / 1M tokens
                    </span>
                    <span>
                      <span className="font-medium">Output:</span>{" "}
                      {formatPrice(model.pricing.completion)} / 1M tokens
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
