"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { MessageQuestionIcon } from "@hugeicons/core-free-icons";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { useAvailableModels } from "../hooks/use-available-models";
import { useViewer } from "../hooks/use-viewer";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type AITabProps = {
  onGoToPreferences?: () => void;
};

export function AITab({ onGoToPreferences }: AITabProps) {
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
    <div className="space-y-0">
      <section className="space-y-4 pb-6">
        <div className="space-y-1">
          <h2 className="text-base font-semibold tracking-tight">Usage</h2>
          <p className="text-xs text-muted-foreground">
            Basic chat activity for your account.
          </p>
        </div>

        {usage === undefined ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-56 rounded-md" />
            <Skeleton className="h-4 w-48 rounded-md" />
          </div>
        ) : (
          <div className="space-y-2 text-xs">
            <p className="text-muted-foreground">
              Messages sent today (UTC):{" "}
              <span className="tabular-nums font-medium text-foreground">
                {usage?.messagesSentToday ?? 0}
              </span>
            </p>
            <p className="text-muted-foreground">
              Total messages sent:{" "}
              <span className="tabular-nums font-medium text-foreground">
                {usage?.messagesSentTotal ?? 0}
              </span>
            </p>
          </div>
        )}
      </section>

      <section className="space-y-6 border-t border-border py-6">
        <div className="space-y-1">
          <h2 className="text-base font-semibold tracking-tight">AI Chat</h2>
          <p className="text-xs text-muted-foreground">
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
                <Skeleton className="h-6 w-10 rounded-md" />
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
                <Skeleton className="h-6 w-10 rounded-md" />
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
                <Skeleton className="h-6 w-10 rounded-md" />
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

      <section className="space-y-6 border-t border-border pt-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-base font-semibold tracking-tight">
                AI Model Settings
              </h2>
              <p className="text-xs text-muted-foreground">
                Browse models and pricing. Your default model is set in
                Preferences.
              </p>
              {!isLoading && (
                <p className="text-[11px] text-muted-foreground">
                  Last synced: {formatSyncTime(lastSyncedAt)}
                </p>
              )}
            </div>
            {isLoading ? (
              <Skeleton className="h-4 w-28 rounded-md" />
            ) : (
              <p className="text-[11px] tabular-nums text-muted-foreground">
                {count} models available
              </p>
            )}
          </div>

          {onGoToPreferences && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-md"
              onClick={onGoToPreferences}
            >
              Change default in Preferences
            </Button>
          )}
        </div>

        <div className="flex flex-col">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2 py-4 first:pt-0">
                  <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-4 w-48 rounded-md" />
                    <Skeleton className="h-3 w-20 rounded-md" />
                  </div>
                  <Skeleton className="h-3 w-full rounded-md" />
                  <Skeleton className="h-3 w-2/3 rounded-md" />
                </div>
              ))}
            </>
          ) : isEmpty ? (
            <div className="flex flex-col items-center py-16 text-center">
              <HugeiconsIcon
                icon={MessageQuestionIcon}
                className="mb-3 size-8 text-muted-foreground"
                aria-hidden
              />
              <p className="text-base font-semibold text-foreground">
                No models available yet
              </p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Models will appear here after the next sync (every 6 hours).
              </p>
            </div>
          ) : (
            models.map((model) => {
              const isSelected = model.modelId === currentDefaultModelId;
              return (
                <div
                  key={model.modelId}
                  className={cn(
                    "space-y-2 rounded-md px-3 py-3 transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
                    isSelected ? "bg-accent" : "hover:bg-accent/50",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium">{model.name}</span>
                        {isSelected && (
                          <span className="text-[11px] text-muted-foreground">
                            Default
                          </span>
                        )}
                      </div>
                      <span className="block font-mono text-[11px] text-muted-foreground">
                        {model.modelId}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {model.description}
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[11px] text-muted-foreground">
                    <span>
                      <span className="font-medium text-foreground/80">
                        Input:
                      </span>{" "}
                      {formatPrice(model.pricing.prompt)} / 1M tokens
                    </span>
                    <span>
                      <span className="font-medium text-foreground/80">
                        Output:
                      </span>{" "}
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
