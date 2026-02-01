"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function AITab() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-base font-medium">AI Model Settings</h2>
          <p className="text-sm text-muted-foreground">
            Select and configure your preferred AI models
          </p>

          {/* AI model selection will go here */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Available Models</label>
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
