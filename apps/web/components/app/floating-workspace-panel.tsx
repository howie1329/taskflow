"use client"

import { useEffect, useId, useRef } from "react"
import { createPortal } from "react-dom"
import { motion, useReducedMotion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

type FloatingWorkspacePanelProps = {
  side: "left" | "right"
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Accessible name for the dialog (e.g. "Workspace" / "Dossier"). */
  title: string
  children: React.ReactNode
  panelClassName?: string
  style?: React.CSSProperties
  "aria-labelledby"?: string
  /**
   * When true (inspector / parallel routes), children stay mounted while closed
   * so Next.js slot content keeps updating off-screen.
   */
  persistMount?: boolean
}

const offScreenClass = (side: "left" | "right") =>
  side === "left" ? "-translate-x-full" : "translate-x-full"

export function FloatingWorkspacePanel({
  side,
  open,
  onOpenChange,
  title,
  children,
  panelClassName,
  style,
  "aria-labelledby": ariaLabelledBy,
  persistMount = false,
}: FloatingWorkspacePanelProps) {
  const isMobile = useIsMobile()
  const reduceMotion = useReducedMotion()
  const titleId = useId()
  const resolvedLabelledBy = ariaLabelledBy ?? titleId
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      e.preventDefault()
      onOpenChange(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onOpenChange])

  useEffect(() => {
    if (!open || !containerRef.current) return
    const root = containerRef.current
    const focusable = root.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    focusable?.focus()
  }, [open])

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const }

  if (isMobile && side === "left" && !persistMount) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="left"
          showCloseButton={false}
          style={style}
          className={cn(
            "bg-sidebar text-sidebar-foreground w-[min(100vw-1rem,var(--panel-w,15rem))] max-w-[min(100vw-1rem,var(--panel-w,15rem))] p-0 [&>button]:hidden",
            panelClassName,
          )}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>Workspace navigation and tools.</SheetDescription>
          </SheetHeader>
          {children}
        </SheetContent>
      </Sheet>
    )
  }

  const persist = persistMount

  const layer = persist ? (
    <>
      <AnimatePresence>
        {open ? (
          <motion.button
            key="backdrop"
            type="button"
            aria-label="Close panel"
            className="fixed inset-0 z-[100] bg-black/40 supports-backdrop-filter:backdrop-blur-xs"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={transition}
            onClick={() => onOpenChange(false)}
          />
        ) : null}
      </AnimatePresence>
      <div
        ref={containerRef}
        role="dialog"
        aria-modal={open}
        aria-hidden={!open}
        aria-labelledby={resolvedLabelledBy}
        data-side={side}
        inert={!open ? true : undefined}
        style={style}
        className={cn(
          "bg-sidebar text-sidebar-foreground border-sidebar-border fixed top-0 z-[110] flex h-svh max-h-svh w-[min(100vw-1rem,var(--panel-w,15rem))] flex-col shadow-lg transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
          reduceMotion && "duration-0",
          side === "left" ? "left-0 border-r" : "right-0 border-l",
          !open && offScreenClass(side),
          !open && "pointer-events-none",
          panelClassName,
        )}
      >
        {!ariaLabelledBy ? (
          <span id={titleId} className="sr-only">
            {title}
          </span>
        ) : null}
        {children}
      </div>
    </>
  ) : (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            key="backdrop"
            type="button"
            aria-label="Close panel"
            className="fixed inset-0 z-[100] bg-black/40 supports-backdrop-filter:backdrop-blur-xs"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={transition}
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={resolvedLabelledBy}
            data-side={side}
            style={style}
            className={cn(
              "bg-sidebar text-sidebar-foreground border-sidebar-border fixed top-0 z-[110] flex h-svh max-h-svh w-[min(100vw-1rem,var(--panel-w,15rem))] flex-col shadow-lg",
              side === "left" ? "left-0 border-r" : "right-0 border-l",
              panelClassName,
            )}
            initial={
              reduceMotion
                ? { x: 0, opacity: 1 }
                : side === "left"
                  ? { x: "-100%", opacity: 1 }
                  : { x: "100%", opacity: 1 }
            }
            animate={{ x: 0, opacity: 1 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : side === "left"
                  ? { x: "-100%", opacity: 1 }
                  : { x: "100%", opacity: 1 }
            }
            transition={transition}
          >
            {!ariaLabelledBy ? (
              <span id={titleId} className="sr-only">
                {title}
              </span>
            ) : null}
            {children}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )

  if (typeof document === "undefined") return null
  return createPortal(layer, document.body)
}
