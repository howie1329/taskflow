"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface ChatShellProps {
  children: React.ReactNode;
}

export function ChatShell({ children }: ChatShellProps) {
  const pathname = usePathname();
  const isThreadRoute =
    pathname.startsWith("/app/chat/") && !pathname.endsWith("/app/chat");

  return (
    <div className="flex h-full flex-1 overflow-hidden bg-background">
      <div
        className={cn(
          "flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-background",
          !isThreadRoute && "hidden md:flex",
        )}
      >
        {children}
      </div>
    </div>
  );
}
