import type { Doc } from "@/convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  Delete02Icon,
  FolderManagementIcon,
  GlobalIcon,
  MoreHorizontalIcon,
  PencilEdit01Icon,
} from "@hugeicons/core-free-icons"

interface ThreadHeaderProps {
  thread: Doc<"thread"> | null | undefined
  project: Doc<"projects"> | null | undefined
  onBackToChats: () => void
  onOpenEditTitle: () => void
  onOpenDeleteThread: () => void
}

export function ThreadHeader({
  thread,
  project,
  onBackToChats,
  onOpenEditTitle,
  onOpenDeleteThread,
}: ThreadHeaderProps) {
  return (
    <div className="shrink-0 border-b border-border/60 bg-background/70 px-2 py-1 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden md:block">
            <SidebarTrigger />
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onBackToChats}
            className="md:hidden"
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              className="size-4"
              strokeWidth={2}
            />
            <span className="sr-only">Back to chats</span>
          </Button>

          <div className="min-w-0">
            <h2 className="truncate text-sm font-medium">
              {thread?.title || "New chat"}
            </h2>
            <div className="mt-0.5 flex items-center gap-2">
              {project ? (
                <Badge variant="outline" className="h-4 rounded-md px-1 text-[10px]">
                  <HugeiconsIcon
                    icon={FolderManagementIcon}
                    className="mr-1 size-3"
                    strokeWidth={2}
                  />
                  {project.icon} {project.title}
                </Badge>
              ) : (
                <Badge variant="outline" className="h-4 rounded-md px-1 text-[10px]">
                  <HugeiconsIcon
                    icon={GlobalIcon}
                    className="mr-1 size-3"
                    strokeWidth={2}
                  />
                  All workspace
                </Badge>
              )}
            </div>
          </div>
        </div>

        {thread && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <HugeiconsIcon
                  icon={MoreHorizontalIcon}
                  className="size-4"
                  strokeWidth={2}
                />
                <span className="sr-only">Conversation actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onOpenEditTitle}>
                <HugeiconsIcon
                  icon={PencilEdit01Icon}
                  className="mr-2 size-4"
                  strokeWidth={2}
                />
                Edit title
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onOpenDeleteThread}
                className="text-destructive focus:text-destructive"
              >
                <HugeiconsIcon
                  icon={Delete02Icon}
                  className="mr-2 size-4"
                  strokeWidth={2}
                />
                Delete thread
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
