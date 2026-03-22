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
      <div className="grid w-full min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.85fr)] lg:gap-6">
        <section className="flex min-h-[min(360px,50vh)] flex-col rounded-lg border border-border bg-card p-5 md:min-h-[360px] md:p-6">
          <Empty className="items-start border-0 p-0 text-left">
            <EmptyHeader className="max-w-xl items-start">
              <EmptyMedia
                variant="icon"
                className="mb-4 size-10 rounded-lg border border-border bg-background text-muted-foreground [&_svg]:size-5"
              >
                <HugeiconsIcon icon={NoteIcon} className="size-5" strokeWidth={2} />
              </EmptyMedia>
              <EmptyTitle className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                A calmer place to capture and shape ideas.
              </EmptyTitle>
              <EmptyDescription className="max-w-lg text-sm leading-relaxed text-muted-foreground">
                Start a blank note instantly, use a template when you need structure,
                or jump back into something recent from the rail.
              </EmptyDescription>
            </EmptyHeader>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                size="default"
                className="h-8 px-3 text-sm font-medium active:scale-[0.98] motion-safe:transition-transform motion-safe:duration-100 motion-safe:ease-out"
                onClick={() => void createNote({ noteType: "blank", templateKey: "blank" })}
              >
                <HugeiconsIcon icon={Add01Icon} className="mr-2 size-4" strokeWidth={2} />
                New blank note
              </Button>
              <Button
                size="default"
                variant="outline"
                className="h-8 px-3 text-sm font-medium active:scale-[0.98] motion-safe:transition-transform motion-safe:duration-100 motion-safe:ease-out"
                onClick={openCreateNotePicker}
              >
                <HugeiconsIcon icon={SparklesIcon} className="mr-2 size-4" strokeWidth={2} />
                Browse templates
              </Button>
            </div>

            <div className="mt-6 grid w-full gap-3 sm:grid-cols-3">
              {tips.map((tip) => (
                <div
                  key={tip.label}
                  className="rounded-lg border border-border bg-background p-4"
                >
                  <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Tip
                  </div>
                  <p className="text-sm font-medium text-foreground">{tip.label}</p>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
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
        </section>

        <aside className="flex min-h-0 flex-col rounded-lg border border-border bg-card p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Recent
              </div>
              <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-foreground">
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

          <div className="flex min-h-0 flex-1 flex-col space-y-2">
            {recentNotes.length > 0 ? (
              recentNotes.map((note) => (
                <button
                  key={note._id}
                  type="button"
                  onClick={() => selectNote(note._id)}
                  className={cn(
                    "group block w-full rounded-lg border border-border bg-background p-4 text-left",
                    "motion-safe:transition-[border-color,background-color,box-shadow] motion-safe:duration-150 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]",
                    "hover:border-border hover:bg-muted/50",
                    "active:scale-[0.98] motion-safe:transition-[border-color,background-color,transform] motion-safe:duration-100",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  )}
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-foreground">
                        {note.title || "Untitled note"}
                      </div>
                      <div className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
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
                  <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    Updated recently
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center">
                <p className="text-sm font-medium text-foreground">No recent notes yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
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
