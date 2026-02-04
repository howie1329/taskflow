"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "./profile-tab/profile-tab";
import { PreferencesTab } from "./preferences-tab/preferences-tab";
import { AITab } from "./ai-settings-tab/ai-tab";

export function SettingsLayout() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="rounded-lg border border-border/60 bg-muted/30 p-2">
        <TabsList variant="line" className="grid w-full grid-cols-3 bg-transparent p-0">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="ai">AI Settings</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="profile" className="mt-4">
        <ProfileTab />
      </TabsContent>

      <TabsContent value="preferences" className="mt-4">
        <PreferencesTab />
      </TabsContent>

      <TabsContent value="ai" className="mt-4">
        <AITab />
      </TabsContent>
    </Tabs>
  );
}
