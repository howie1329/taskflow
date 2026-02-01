export const metadata = {
  title: "Settings | Taskflow",
  description: "Manage your account and preferences",
};

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Configure your workspace
          </p>
        </div>
      </div>
      <div className="rounded-none border border-dashed p-8">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <h3 className="text-sm font-medium">Settings coming soon</h3>
          <p className="text-xs text-muted-foreground">
            Manage your account, preferences, and workspace options
          </p>
        </div>
      </div>
    </div>
  );
}
