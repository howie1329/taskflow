"use client"

import { useEffect, type RefObject } from "react"
import { shouldIgnoreGlobalShortcut } from "@/lib/should-ignore-global-shortcut"

export function useSlashFocusSearch(inputRef: RefObject<HTMLInputElement | null>) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        event.key === "/" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !shouldIgnoreGlobalShortcut(event.target)
      ) {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [inputRef])
}
