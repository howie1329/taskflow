"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAvailableModels } from "../hooks/use-available-models";
import { useViewer } from "../hooks/use-viewer";

export function AITab() {
  const { models, isLoading, isEmpty, lastSyncedAt, count } =
    useAvailableModels();
  const { preferences } = useViewer();

  const currentDefaultModelId = preferences?.defaultAIModel?.modelId;

  const formatSyncTime = (timestamp: number | null) => {
    if (!timestamp) return "Never";
    return new Date(timestamp).toLocaleString();
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (isNaN(num)) return "$0.00";
    return `$${num.toFixed(6)}`;
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          {/* Header */}
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

          {/* Model List */}
          <div className="space-y-4">
            {isLoading ? (
              // Loading skeletons
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border rounded-lg space-y-3">
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
              <div className="text-center py-8">
                <p className="text-muted-foreground">No models available yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Models will appear here after the next sync (every 6 hours)
                </p>
              </div>
            ) : (
              models.map((model) => {
                const isSelected = model.modelId === currentDefaultModelId;
                return (
                  <div
                    key={model.modelId}
                    className={`p-4 border rounded-lg space-y-3 ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{model.name}</span>
                          {isSelected && (
                            <Badge variant="default">Selected</Badge>
                          )}
                        </div>
                        <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {model.modelId}
                        </code>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {model.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t">
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
        </div>
      </Card>
    </div>
  );
}
