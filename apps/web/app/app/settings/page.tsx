import { SettingsLayout } from "@/components/settings/settings-layout";

export const metadata = {
  title: "Settings | Taskflow",
  description: "Manage your account and preferences",
};

export default function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col px-4 py-6 md:px-8 md:py-10">
      <div className="mb-6 flex items-center justify-between md:mb-8">
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
