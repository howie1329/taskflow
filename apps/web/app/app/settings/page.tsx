import { SettingsLayout } from "@/components/settings/settings-layout";

export const metadata = {
  title: "Settings | Taskflow",
  description: "Manage your account and preferences",
};

export default function SettingsPage() {
  return (
    <div className="flex h-full min-h-0 w-full flex-col px-3 py-3 md:px-5 md:py-5">
      <div className="mb-5 flex items-center justify-between md:mb-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your profile, preferences, and AI settings
          </p>
        </div>
      </div>
      <SettingsLayout />
    </div>
  );
}
