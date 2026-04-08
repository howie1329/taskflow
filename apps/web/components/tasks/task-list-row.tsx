"use client"

import type { Doc } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils"
import { priorityDotClassName } from "@/lib/task-priority-styles"

type Task = Doc<"tasks">

function formatDueLabel(timestamp: number | null | undefined) {
  if (!timestamp) return null
  const date = new Date(timestamp)
  const today = new Date()
  const diffDays = Math.ceil(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  )
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Tomorrow"
  if (diffDays < 0) return "Overdue"
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function StatusGlyph({ status }: { status: Task["status"] }) {
  if (status === "Completed") {
    return (
      <span
        className="size-2 shrink-0 rounded-full bg-muted-foreground/45"
        aria-hidden
      />
    )
  }
  if (status === "In Progress") {
    return (
      <span
        className="size-2 shrink-0 rounded-full bg-foreground/55"
        aria-hidden
      />
    )
  }
  return (
    <span
      className="size-2 shrink-0 rounded-full border border-muted-foreground/80 bg-transparent"
      aria-hidden
    />
  )
}

interface TaskListRowProps {
  task: Task
  onClick: (task: Task) => void
}

export function TaskListRow({ task, onClick }: TaskListRowProps) {
  const isCompleted = task.status === "Completed"
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()
  const dueLabel = formatDueLabel(task.dueDate)

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        "flex cursor-pointer items-center gap-2 px-3 py-2 transition-[background-color,color] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
      onClick={() => onClick(task)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick(task)
        }
      }}
    >
      <StatusGlyph status={task.status} />
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-xs font-medium leading-tight text-foreground",
          isCompleted && "text-muted-foreground line-through decoration-muted-foreground/70",
        )}
      >
        {task.title}
      </span>
      <div className="flex shrink-0 items-center gap-2">
        {dueLabel ? (
          <span
            className={cn(
              "text-[11px] tabular-nums text-muted-foreground",
              isOverdue && !isCompleted && "text-destructive",
            )}
            title={
              task.dueDate
                ? new Date(task.dueDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : undefined
            }
          >
            {dueLabel}
          </span>
        ) : null}
        <span
          className={cn(
            "size-1.5 shrink-0 rounded-full opacity-85",
            priorityDotClassName(task.priority),
          )}
          title={`Priority: ${task.priority}`}
          aria-label={`Priority: ${task.priority}`}
        />
      </div>
    </div>
  )
}
