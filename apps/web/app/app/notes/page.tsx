export const metadata = {
  title: "Notes | Taskflow",
  description: "Your knowledge base and notes",
};

export default function NotesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Capture ideas and information
          </p>
        </div>
      </div>
      <div className="rounded-none border border-dashed p-8">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <h3 className="text-sm font-medium">No notes yet</h3>
          <p className="text-xs text-muted-foreground">
            Create your first note to build your knowledge base
          </p>
        </div>
      </div>
    </div>
  );
}
