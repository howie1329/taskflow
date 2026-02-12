"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "./profile-tab/profile-tab";
import { PreferencesTab } from "./preferences-tab/preferences-tab";
import { AITab } from "./ai-settings-tab/ai-tab";

export function SettingsLayout() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      orientation="vertical"
      className="w-full gap-4 md:grid md:grid-cols-[220px_1fr] md:gap-8"
    >
      <div className="md:hidden">
        <TabsList
          variant="line"
          className="grid h-auto w-full grid-cols-3 rounded-lg border border-border/60 bg-background p-1"
        >
          <TabsTrigger value="profile" className="py-1.5 text-sm">
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences" className="py-1.5 text-sm">
            Preferences
          </TabsTrigger>
          <TabsTrigger value="ai" className="py-1.5 text-sm">
            AI Settings
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="hidden md:block md:sticky md:top-6 md:h-fit md:border-r md:border-border/60 md:pr-6">
        <TabsList
          variant="line"
          className="h-auto w-full flex-col items-stretch gap-1 bg-transparent p-0 text-sm"
        >
          <TabsTrigger
            value="profile"
            className="h-auto justify-start px-3 py-2.5 text-sm data-active:bg-muted/40"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="preferences"
            className="h-auto justify-start px-3 py-2.5 text-sm data-active:bg-muted/40"
          >
            Preferences
          </TabsTrigger>
          <TabsTrigger
            value="ai"
            className="h-auto justify-start px-3 py-2.5 text-sm data-active:bg-muted/40"
          >
            AI Settings
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="rounded-xl border border-border/60 bg-background p-6 md:p-8">
        <TabsContent value="profile" className="mt-0 text-sm">
          <ProfileTab />
        </TabsContent>

        <TabsContent value="preferences" className="mt-0 text-sm">
          <PreferencesTab />
        </TabsContent>

        <TabsContent value="ai" className="mt-0 text-sm">
          <AITab />
        </TabsContent>
      </div>
    </Tabs>
  );
}
