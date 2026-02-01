"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { useViewer } from "../hooks/use-viewer";

export function PreferencesTab() {
  const { isLoading, preferences } = useViewer();

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-base font-medium">General Preferences</h2>
          <p className="text-sm text-muted-foreground">
            Customize your workspace experience
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Default AI Model</label>
              {isLoading ? (
                <Skeleton className="h-8 w-full" />
              ) : (
                <div className="text-sm text-muted-foreground">
                  {preferences?.defaultAIModel || "No model selected"}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Model selection UI will be added in Phase III
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
