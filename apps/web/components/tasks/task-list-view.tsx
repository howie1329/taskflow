"use client"

import type { Doc } from "@/convex/_generated/dataModel"
import { TaskListRow } from "@/components/tasks/task-list-row"
import { AddTaskCard } from "@/components/tasks/add-task-card"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"
import { ChevronDown } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

type Task = Doc<"tasks">

const columns = [
  { id: "Not Started", label: "Not Started" },
  { id: "To Do", label: "To Do" },
  { id: "In Progress", label: "In Progress" },
  { id: "Completed", label: "Completed" },
] as const

interface TaskListViewProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onCreateTask: (defaults: { status: Task["status"] }) => void
  hideCompleted?: boolean
}

export function TaskListView({
  tasks,
  onTaskClick,
  onCreateTask,
  hideCompleted = false,
}: TaskListViewProps) {
  const isMobile = useIsMobile()

  const getTasksByStatus = (status: string) =>
    tasks
      .filter((task) => task.status === status)
      .sort((a, b) => a.orderIndex - b.orderIndex)

  const visibleColumns = hideCompleted
    ? columns.filter((c) => c.id !== "Completed")
    : columns

  return (
    <div className="flex min-h-0 h-full w-full flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="flex flex-col gap-1 pb-2">
        {visibleColumns.map((column) => {
          const columnTasks = getTasksByStatus(column.id)

          return (
            <Collapsible key={column.id} defaultOpen className="min-w-0">
              <div className="flex h-9 min-h-9 shrink-0 items-center gap-1 border-b border-border/40 pr-1">
                <CollapsibleTrigger
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-2 py-1.5 text-left",
                    "text-muted-foreground outline-none transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-accent/40 hover:text-foreground",
                    "focus-visible:ring-2 focus-visible:ring-ring",
                    "data-[state=closed]:[&>svg:first-child]:-rotate-90",
                  )}
                >
                  <ChevronDown
                    className="size-3 shrink-0 transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    aria-hidden
                  />
                  <span className="truncate text-xs font-medium text-foreground">
                    {column.label}
                  </span>
                  <span className="shrink-0 tabular-nums text-[11px] text-muted-foreground">
                    {columnTasks.length}
                  </span>
                </CollapsibleTrigger>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className={cn(
                    "shrink-0 text-muted-foreground",
                    isMobile ? "size-8" : "size-7",
                  )}
                  onClick={() => onCreateTask({ status: column.id })}
                  aria-label={`Add task to ${column.label}`}
                >
                  <HugeiconsIcon icon={Add01Icon} />
                </Button>
              </div>
              <CollapsibleContent>
                <div className="min-w-0 pt-0.5">
                  {columnTasks.map((task) => (
                    <TaskListRow
                      key={task._id}
                      task={task}
                      onClick={onTaskClick}
                    />
                  ))}
                  <AddTaskCard
                    onClick={() => onCreateTask({ status: column.id })}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          )
        })}
        </div>
      </div>
    </div>
  )
}
