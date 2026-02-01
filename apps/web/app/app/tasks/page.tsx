export const metadata = {
  title: "Tasks | Taskflow",
  description: "Manage your tasks and to-dos",
};

export default function TasksPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Organize and track your work
          </p>
        </div>
      </div>
      <div className="rounded-none border border-dashed p-8">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <h3 className="text-sm font-medium">No tasks yet</h3>
          <p className="text-xs text-muted-foreground">
            Create your first task to get started
          </p>
        </div>
      </div>
    </div>
  );
}
