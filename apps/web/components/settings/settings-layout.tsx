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

const mobilePillTriggerClass =
  "h-7 rounded-md px-2 text-xs font-medium text-muted-foreground transition-[color,background-color] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none data-active:bg-accent data-active:text-accent-foreground data-active:shadow-none after:!hidden sm:px-2.5";

const navTriggerClass = cn(
  "h-8 w-full justify-start gap-1.5 rounded-md px-3 text-xs font-medium text-muted-foreground transition-[color,background-color] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
  "hover:bg-accent/50 hover:text-foreground",
  "data-active:bg-accent data-active:font-medium data-active:text-accent-foreground",
  "after:!hidden data-active:after:!hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
);

/** Scrolls inside the right column only; nav stays fixed and clickable. */
const contentScrollClass =
  "min-h-0 w-full flex-1 overflow-y-auto overscroll-contain px-0 pb-4 pt-0 text-xs md:pl-6";

const tabPanelClass =
  "mt-0 flex h-full min-h-0 flex-col overflow-hidden data-[state=inactive]:hidden";

export function SettingsLayout() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      orientation="vertical"
      className={cn(
        "flex min-h-0 w-full flex-1 flex-col gap-4",
        "md:grid md:h-full md:min-h-0 md:grid-cols-[224px_minmax(0,1fr)] md:grid-rows-1 md:items-stretch md:gap-8",
      )}
    >
      <div className="shrink-0 md:hidden">
        <TabsList
          variant="line"
          className="grid h-auto w-full grid-cols-3 rounded-md border border-border/70 bg-transparent p-0.5"
        >
          <TabsTrigger
            value="profile"
            className={cn(mobilePillTriggerClass, "px-1")}
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="preferences"
            className={cn(mobilePillTriggerClass, "px-1")}
          >
            Preferences
          </TabsTrigger>
          <TabsTrigger
            value="ai"
            className={cn(mobilePillTriggerClass, "px-0.5")}
          >
            AI Settings
          </TabsTrigger>
        </TabsList>
      </div>

      <div
        className={cn(
          "hidden shrink-0 md:col-start-1 md:row-start-1 md:flex md:flex-col",
          "md:border-r md:border-border md:pr-6",
        )}
      >
        <TabsList
          variant="line"
          className="h-auto w-full flex-col items-stretch gap-1 bg-transparent p-0"
        >
          <TabsTrigger value="profile" className={navTriggerClass}>
            <HugeiconsIcon icon={UserIcon} className="size-3 shrink-0" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences" className={navTriggerClass}>
            <HugeiconsIcon icon={Settings02Icon} className="size-3 shrink-0" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="ai" className={navTriggerClass}>
            <HugeiconsIcon
              icon={MessageQuestionIcon}
              className="size-3 shrink-0"
            />
            AI Settings
          </TabsTrigger>
        </TabsList>
      </div>

      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
          "md:col-start-2 md:row-start-1 md:h-full md:min-h-0 md:max-h-full md:flex-1 md:self-stretch",
        )}
      >
        <TabsContent value="profile" className={tabPanelClass}>
          <div className={contentScrollClass}>
            <div className="max-w-[560px]">
              <ProfileTab />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className={tabPanelClass}>
          <div className={contentScrollClass}>
            <div className="max-w-[560px]">
              <PreferencesTab />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ai" className={tabPanelClass}>
          <div className={contentScrollClass}>
            <div className="max-w-[560px]">
              <AITab onGoToPreferences={() => setActiveTab("preferences")} />
            </div>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}
