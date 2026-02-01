export const metadata = {
  title: "Projects | Taskflow",
  description: "Manage your projects and initiatives",
};

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Group related work together
          </p>
        </div>
      </div>
      <div className="rounded-none border border-dashed p-8">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <h3 className="text-sm font-medium">No projects yet</h3>
          <p className="text-xs text-muted-foreground">
            Create a project to organize your tasks
          </p>
        </div>
      </div>
    </div>
  );
}
