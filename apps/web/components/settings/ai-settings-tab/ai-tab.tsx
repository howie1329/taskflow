"use client";

import { Card } from "@/components/ui/card";

export function AITab() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-base font-medium">AI Model Settings</h2>
          <p className="text-sm text-muted-foreground">
            AI model selection is being rebuilt. Check back soon!
          </p>
        </div>
      </Card>
    </div>
  );
}
