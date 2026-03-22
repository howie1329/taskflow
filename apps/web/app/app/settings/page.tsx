import { SettingsLayout } from "@/components/settings/settings-layout";

export const metadata = {
  title: "Settings | Taskflow",
  description: "Manage your account and preferences",
};

export default function SettingsPage() {
  return (
    <div className="flex h-full min-h-0 w-full flex-col px-6 py-6 md:px-8">
      <div className="mb-6 shrink-0">
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, preferences, and AI settings
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <SettingsLayout />
      </div>
    </div>
  );
}
