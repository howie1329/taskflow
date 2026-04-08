import { SettingsLayout } from "@/components/settings/settings-layout";

export const metadata = {
  title: "Settings | Taskflow",
  description: "Manage your account and preferences",
};

export default function SettingsPage() {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden px-4 py-3">
      <div className="shrink-0 border-b border-border/50 pb-3">
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-xs text-muted-foreground">
          Manage your profile, preferences, and AI settings
        </p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-4">
        <SettingsLayout />
      </div>
    </div>
  );
}
