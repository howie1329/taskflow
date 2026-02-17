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
      className="h-full min-h-0 w-full gap-4 md:grid md:grid-cols-[240px_1fr] md:gap-8"
    >
      <div className="md:hidden">
        <TabsList
          variant="line"
          className="grid h-auto w-full grid-cols-3 rounded-lg border border-border/60 bg-background p-1"
        >
          <TabsTrigger value="profile" className="py-2 text-sm font-medium">
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences" className="py-2 text-sm font-medium">
            Preferences
          </TabsTrigger>
          <TabsTrigger value="ai" className="py-2 text-sm font-medium">
            AI Settings
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="hidden md:block md:sticky md:top-4 md:h-fit md:border-r md:border-border/60 md:pr-6">
        <TabsList
          variant="line"
          className="h-auto w-full flex-col items-stretch gap-1 bg-transparent p-0 text-sm"
        >
          <TabsTrigger
            value="profile"
            className="h-auto justify-start rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/25 hover:text-foreground data-active:bg-muted/40 data-active:text-foreground"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="preferences"
            className="h-auto justify-start rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/25 hover:text-foreground data-active:bg-muted/40 data-active:text-foreground"
          >
            Preferences
          </TabsTrigger>
          <TabsTrigger
            value="ai"
            className="h-auto justify-start rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/25 hover:text-foreground data-active:bg-muted/40 data-active:text-foreground"
          >
            AI Settings
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="min-h-0 rounded-xl border border-border/60 bg-background p-6 md:flex md:h-full md:flex-col md:p-8">
        <TabsContent
          value="profile"
          className="mt-0 text-sm md:min-h-0 md:flex-1 md:overflow-y-auto md:pr-1"
        >
          <ProfileTab />
        </TabsContent>

        <TabsContent
          value="preferences"
          className="mt-0 text-sm md:min-h-0 md:flex-1 md:overflow-y-auto md:pr-1"
        >
          <PreferencesTab />
        </TabsContent>

        <TabsContent
          value="ai"
          className="mt-0 text-sm md:min-h-0 md:flex-1 md:overflow-y-auto md:pr-1"
        >
          <AITab />
        </TabsContent>
      </div>
    </Tabs>
  );
}
