"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  nextWorkspaceHopHref,
  prevWorkspaceHopHref,
} from "@/lib/workspace-route-cycle"
import { shouldIgnoreGlobalShortcut } from "@/lib/should-ignore-global-shortcut"
import { trackWorkspaceRouteCycle } from "@/lib/workspace-shell-analytics"

/**
 * Global route hop: ⌘⌥→ (or Ctrl+Alt+→) next, ⌘⌥← previous.
 * Ignored inside inputs / contenteditable (same as sidebar shortcuts).
 */
export function useWorkspaceRouteCycle(enabled: boolean) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!enabled) return

    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey
      if (!mod || !event.altKey) return
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return
      if (shouldIgnoreGlobalShortcut(event.target)) return

      const forward = event.key === "ArrowRight"
      const href = forward
        ? nextWorkspaceHopHref(pathname)
        : prevWorkspaceHopHref(pathname)
      if (!href) return

      event.preventDefault()
      trackWorkspaceRouteCycle(forward ? "next" : "prev")
      router.push(href)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [enabled, pathname, router])
}
