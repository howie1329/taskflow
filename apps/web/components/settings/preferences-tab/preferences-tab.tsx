"use client";

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
                <div className="h-8 w-48 bg-muted rounded animate-pulse" />
              ) : (
                <div className="text-sm text-muted-foreground">
                  {preferences?.defaultAIModel || (
                    <span className="italic">
                      No model selected (AI models being rebuilt)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
