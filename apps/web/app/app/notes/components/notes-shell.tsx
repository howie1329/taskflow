"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NotesShellProps {
  children: React.ReactNode;
}

export function NotesShell({ children }: NotesShellProps) {
  const pathname = usePathname();
  const isNoteRoute =
    pathname.startsWith("/app/notes/") && !pathname.endsWith("/app/notes");

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden bg-background">
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col bg-background",
          !isNoteRoute && "hidden md:flex",
        )}
      >
        {children}
      </div>
    </div>
  );
}
