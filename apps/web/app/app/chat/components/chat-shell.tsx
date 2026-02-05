"use client"

import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface ChatShellProps {
  children: React.ReactNode
}

export function ChatShell({ children }: ChatShellProps) {
  const pathname = usePathname()
  const isThreadRoute = pathname.startsWith("/app/chat/") && !pathname.endsWith("/app/chat")

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden rounded-xl border border-border/60 bg-card/40 dark:bg-card/20">
      <div
        className={cn(
          "flex-1 min-w-0 flex flex-col bg-background",
          !isThreadRoute && "hidden md:flex",
        )}
      >
        {children}
      </div>
    </div>
  )
}
