export const metadata = {
  title: "AI Chat | Taskflow",
  description: "Chat with your AI assistant",
};

export default function ChatPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Ask questions and get help from AI
          </p>
        </div>
      </div>
      <div className="rounded-none border border-dashed p-8">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <h3 className="text-sm font-medium">AI Chat coming soon</h3>
          <p className="text-xs text-muted-foreground">
            Get assistance with your tasks and projects
          </p>
        </div>
      </div>
    </div>
  );
}
