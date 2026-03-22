"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  Settings02Icon,
  MessageQuestionIcon,
} from "@hugeicons/core-free-icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "./profile-tab/profile-tab";
import { PreferencesTab } from "./preferences-tab/preferences-tab";
import { AITab } from "./ai-settings-tab/ai-tab";
import { cn } from "@/lib/utils";

const navTriggerClass =
  "h-8 justify-start gap-1.5 rounded-md px-3 text-sm font-medium text-muted-foreground transition-[color,background-color] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none hover:bg-muted hover:text-foreground data-active:bg-muted data-active:font-medium data-active:text-foreground";

const mobileTriggerClass =
  "h-8 px-2 text-sm font-medium transition-[color,background-color] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none";

export function SettingsLayout() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      orientation="vertical"
      className="h-full min-h-0 w-full gap-4 md:grid md:grid-cols-[224px_1fr] md:gap-8"
    >
      <div className="md:hidden">
        <TabsList
          variant="line"
          className="grid h-auto w-full grid-cols-3 rounded-xl border border-border bg-card p-1"
        >
          <TabsTrigger value="profile" className={cn(mobileTriggerClass, "text-xs")}>
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="preferences"
            className={cn(mobileTriggerClass, "text-xs")}
          >
            Preferences
          </TabsTrigger>
          <TabsTrigger
            value="ai"
            className={cn(mobileTriggerClass, "px-1 text-xs")}
          >
            AI Settings
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="hidden md:block md:sticky md:top-4 md:h-fit md:border-r md:border-border md:pr-6">
        <TabsList
          variant="line"
          className="h-auto w-full flex-col items-stretch gap-1 bg-transparent p-0 text-sm"
        >
          <TabsTrigger value="profile" className={cn(navTriggerClass, "w-full")}>
            <HugeiconsIcon icon={UserIcon} className="size-4 shrink-0" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="preferences"
            className={cn(navTriggerClass, "w-full")}
          >
            <HugeiconsIcon icon={Settings02Icon} className="size-4 shrink-0" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="ai" className={cn(navTriggerClass, "w-full")}>
            <HugeiconsIcon
              icon={MessageQuestionIcon}
              className="size-4 shrink-0"
            />
            AI Settings
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="flex min-h-0 flex-col rounded-xl border border-border bg-card md:h-full">
        <TabsContent
          value="profile"
          className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden text-sm data-[state=inactive]:hidden"
        >
          <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-[560px]">
              <ProfileTab />
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="preferences"
          className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden text-sm data-[state=inactive]:hidden"
        >
          <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-[560px]">
              <PreferencesTab />
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="ai"
          className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden text-sm data-[state=inactive]:hidden"
        >
          <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-[560px]">
              <AITab onGoToPreferences={() => setActiveTab("preferences")} />
            </div>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}
