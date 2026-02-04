import { SettingsLayout } from "@/components/settings/settings-layout";

export const metadata = {
  title: "Settings | Taskflow",
  description: "Manage your account and preferences",
};

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your profile, preferences, and AI settings
          </p>
        </div>
      </div>
      <SettingsLayout />
    </div>
  );
}
