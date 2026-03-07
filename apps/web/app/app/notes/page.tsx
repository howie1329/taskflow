"use client";

import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  NoteIcon,
  Add01Icon,
  ArrowRight01Icon,
  SparklesIcon,
  PinIcon,
} from "@hugeicons/core-free-icons";
import { useNotes } from "@/components/notes";
import { cn } from "@/lib/utils";

export default function NotesPage() {
  const prefersReducedMotion = useReducedMotion()
  const { createNote, openCreateNotePicker, sortedNotes, selectNote } = useNotes()
  const recentNotes = sortedNotes.slice(0, 4)
  const tips = [
    { label: "Create in one step", shortcut: "⌘ N" },
    { label: "Jump to search", shortcut: "/" },
    { label: "Pin important notes", shortcut: "Keep favorites at the top" },
  ]

  return (
    <div className="flex h-full w-full min-h-0 px-4 py-3 md:px-6 md:py-5">
      <div className="grid w-full min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <motion.section
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[28px] border border-border/50 bg-linear-to-br from-background via-background to-muted/35 p-4 shadow-sm md:p-6"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--foreground)/0.06),transparent_34%),radial-gradient(circle_at_bottom_left,hsl(var(--foreground)/0.04),transparent_28%)]" />
          <Empty className="relative min-h-[360px] items-start border-0 p-0 text-left">
            <EmptyHeader className="max-w-xl items-start">
              <EmptyMedia
                variant="icon"
                className="mb-4 size-12 rounded-2xl border border-border/60 bg-background shadow-sm [&_svg]:size-5"
              >
                <HugeiconsIcon icon={NoteIcon} className="size-5" />
              </EmptyMedia>
              <EmptyTitle className="text-2xl font-semibold tracking-tight md:text-3xl">
                A calmer place to capture and shape ideas.
              </EmptyTitle>
              <EmptyDescription className="max-w-lg text-sm leading-6">
                Start a blank note instantly, use a template when you need structure,
                or jump back into something recent from the rail.
              </EmptyDescription>
            </EmptyHeader>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="rounded-full px-5"
                onClick={() => void createNote({ noteType: "blank", templateKey: "blank" })}
              >
                <HugeiconsIcon icon={Add01Icon} className="mr-2 size-4" />
                New blank note
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-5"
                onClick={openCreateNotePicker}
              >
                <HugeiconsIcon icon={SparklesIcon} className="mr-2 size-4" />
                Browse templates
              </Button>
            </div>

            <div className="mt-8 grid w-full gap-3 md:grid-cols-3">
              {tips.map((tip) => (
                <div
                  key={tip.label}
                  className="rounded-2xl border border-border/50 bg-background/80 p-4 shadow-sm"
                >
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Tip
                  </div>
                  <p className="text-sm font-medium text-foreground">{tip.label}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    {tip.shortcut.includes("⌘") ? (
                      <>
                        <Kbd>⌘</Kbd>
                        <span>{tip.shortcut.replace("⌘ ", "")}</span>
                      </>
                    ) : tip.shortcut === "/" ? (
                      <Kbd>/</Kbd>
                    ) : (
                      <span>{tip.shortcut}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Empty>
        </motion.section>

        <motion.aside
          initial={prefersReducedMotion ? false : { opacity: 0, x: 12 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
          transition={{ duration: 0.28, delay: prefersReducedMotion ? 0 : 0.04, ease: "easeOut" }}
          className="min-h-0 rounded-[28px] border border-border/50 bg-background/90 p-4 shadow-sm md:p-5"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Recent
              </div>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">Pick up where you left off</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full"
              onClick={openCreateNotePicker}
            >
              See templates
            </Button>
          </div>

          <div className="space-y-3">
            {recentNotes.length > 0 ? (
              recentNotes.map((note, index) => (
                <motion.button
                  key={note._id}
                  type="button"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.22,
                    delay: prefersReducedMotion ? 0 : 0.05 + index * 0.04,
                    ease: "easeOut",
                  }}
                  onClick={() => selectNote(note._id)}
                  className="group block w-full rounded-2xl border border-border/50 bg-background px-4 py-4 text-left transition-all duration-200 hover:border-border hover:bg-muted/35 hover:shadow-sm"
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-foreground">
                        {note.title || "Untitled note"}
                      </div>
                      <div className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                        {note.contentText.trim() || "Blank note waiting for a first thought."}
                      </div>
                    </div>
                    <HugeiconsIcon
                      icon={note.pinned ? PinIcon : ArrowRight01Icon}
                      className={cn(
                        "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                        !note.pinned && "group-hover:translate-x-0.5",
                      )}
                    />
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    Updated recently
                  </div>
                </motion.button>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-4 py-8 text-center">
                <p className="text-sm font-medium">No recent notes yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Create your first note and it will show up here for quick return.
                </p>
              </div>
            )}
          </div>
        </motion.aside>
      </div>
    </div>
  )
}
