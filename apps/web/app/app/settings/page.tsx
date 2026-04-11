import { SettingsLayout } from "@/components/settings/settings-layout";

export const metadata = {
  title: "Settings | Taskflow",
  description: "Manage your account and preferences",
};

export default function SettingsPage() {
  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden px-4 pb-4 pt-3">
      <SettingsLayout />
    </div>
  )
}
