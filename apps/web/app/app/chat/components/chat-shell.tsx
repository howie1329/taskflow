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
    <div className="flex flex-1 h-full overflow-hidden rounded-md bg-card/40 dark:bg-card/20">
      <div
        className={cn(
          "flex-1 min-w-0 h-full flex flex-col bg-background overflow-hidden",
          !isThreadRoute && "hidden md:flex",
        )}
      >
        {children}
      </div>
    </div>
  );
}
