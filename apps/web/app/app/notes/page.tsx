"use client"

import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  NoteIcon,
  Add01Icon,
  ArrowRight01Icon,
  SparklesIcon,
  PinIcon,
} from "@hugeicons/core-free-icons"
import { useNotes } from "@/components/notes"
import { cn } from "@/lib/utils"

export default function NotesPage() {
  const { createNote, openCreateNotePicker, sortedNotes, selectNote } = useNotes()
  const recentNotes = sortedNotes.slice(0, 4)
  const tips = [
    { label: "Create in one step", shortcut: "⌘ N" },
    { label: "Jump to search", shortcut: "/" },
    { label: "Pin important notes", shortcut: "Keep favorites at the top" },
  ]

  return (
    <div className="flex h-full w-full min-h-0 px-4 py-4 md:px-8 md:py-6">
      <div className="grid w-full min-h-0 flex-1 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.85fr)] lg:gap-8">
        <section className="flex min-h-[min(360px,50vh)] flex-col md:min-h-[360px]">
          <Empty className="items-start border-0 p-0 text-left">
            <EmptyHeader className="max-w-xl items-start">
              <EmptyMedia
                variant="icon"
                className="mb-4 size-10 rounded-lg bg-muted/30 text-muted-foreground [&_svg]:size-5"
              >
                <HugeiconsIcon icon={NoteIcon} className="size-5" strokeWidth={2} />
              </EmptyMedia>
              <EmptyTitle className="text-xl font-semibold leading-tight tracking-tight text-foreground">
                A calmer place to capture and shape ideas.
              </EmptyTitle>
              <EmptyDescription className="max-w-lg text-xs leading-snug text-muted-foreground">
                Start a blank note instantly, use a template when you need structure,
                or jump back into something recent from the rail.
              </EmptyDescription>
            </EmptyHeader>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                size="default"
                className="h-8 px-3 text-xs font-medium motion-safe:transition-transform motion-safe:duration-150 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:active:scale-[0.98]"
                onClick={() => void createNote({ noteType: "blank", templateKey: "blank" })}
              >
                <HugeiconsIcon icon={Add01Icon} className="mr-2 size-4" strokeWidth={2} />
                New blank note
              </Button>
              <Button
                size="default"
                variant="ghost"
                className="h-8 px-3 text-xs font-medium text-muted-foreground motion-safe:transition-[color,background-color,transform] motion-safe:duration-150 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-foreground motion-safe:active:scale-[0.98]"
                onClick={openCreateNotePicker}
              >
                <HugeiconsIcon icon={SparklesIcon} className="mr-2 size-4" strokeWidth={2} />
                Browse templates
              </Button>
            </div>

            <div className="mt-8 border-t border-border/50 pt-6">
              <p className="mb-4 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Tips
              </p>
              <ul className="space-y-5">
                {tips.map((tip) => (
                  <li key={tip.label}>
                    <p className="text-xs font-medium text-foreground">{tip.label}</p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] leading-tight text-muted-foreground">
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
                  </li>
                ))}
              </ul>
            </div>
          </Empty>
        </section>

        <aside className="flex min-h-0 flex-col lg:border-l lg:border-border/50 lg:pl-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Recent
              </div>
              <h2 className="mt-0.5 text-base font-semibold leading-tight tracking-tight text-foreground">
                Pick up where you left off
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 px-2 text-xs"
              onClick={openCreateNotePicker}
            >
              Templates
            </Button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-1">
            {recentNotes.length > 0 ? (
              recentNotes.map((note) => (
                <button
                  key={note._id}
                  type="button"
                  onClick={() => selectNote(note._id)}
                  className={cn(
                    "group block w-full rounded-md px-3 py-2 text-left",
                    "motion-safe:transition-colors motion-safe:duration-150 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]",
                    "hover:bg-accent/50",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-xs font-medium text-foreground">
                        {note.title || "Untitled note"}
                      </div>
                      <div className="mt-1 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                        {note.contentText.trim() || "Blank note waiting for a first thought."}
                      </div>
                    </div>
                    <HugeiconsIcon
                      icon={note.pinned ? PinIcon : ArrowRight01Icon}
                      className={cn(
                        "mt-0.5 size-4 shrink-0 text-muted-foreground motion-safe:duration-150 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]",
                        !note.pinned &&
                          "motion-safe:transition-transform [@media(hover:hover)_and_(pointer:fine)]:group-hover:translate-x-0.5",
                      )}
                      strokeWidth={2}
                    />
                  </div>
                  <div className="mt-2 text-[11px] font-medium text-muted-foreground">
                    Updated recently
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-md border border-dashed border-border/50 px-4 py-8 text-center">
                <p className="text-xs font-medium text-foreground">No recent notes yet</p>
                <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                  Create your first note and it will show up here for quick return.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
