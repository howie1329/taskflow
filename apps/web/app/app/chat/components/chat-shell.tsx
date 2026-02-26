"use client"

interface ChatShellProps {
  children: React.ReactNode;
}

export function ChatShell({ children }: ChatShellProps) {
  return (
    <div className="flex h-full flex-1 overflow-hidden bg-background">
      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-background">
        {children}
      </div>
    </div>
  )
}
