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

type ThreadUsageTotals = {
  totalCostUsdMicros?: number
}

export function ThreadHeader({
  thread,
  project,
  onBackToChats,
  onOpenEditTitle,
  onOpenDeleteThread,
}: ThreadHeaderProps) {
  const totalCostUsdMicros = (
    thread as (Doc<"thread"> & { usageTotals?: ThreadUsageTotals }) | null | undefined
  )?.usageTotals?.totalCostUsdMicros
  const formattedTotalCost =
    totalCostUsdMicros === undefined
      ? null
      : new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(totalCostUsdMicros / 1_000_000)

  return (
    <div className="shrink-0 border-b border-border/50 bg-background/90 px-2 py-2 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
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

          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate text-[15px] font-medium tracking-tight">
              {thread?.title || "New chat"}
            </h2>
            {formattedTotalCost && (
              <Badge
                variant="secondary"
                className="h-6 rounded-full border border-border/60 bg-muted/35 px-2.5 text-[11px] font-normal text-muted-foreground"
              >
                {formattedTotalCost}
              </Badge>
            )}
            {project ? (
              <Badge
                variant="secondary"
                className="h-6 max-w-[160px] items-center truncate rounded-full border border-border/60 bg-muted/35 px-2.5 text-[11px] font-normal text-muted-foreground"
              >
                <HugeiconsIcon
                  icon={FolderManagementIcon}
                  className="mr-1.5 size-3.5 shrink-0"
                  strokeWidth={2}
                />
                <span className="truncate">
                  {project.icon} {project.title}
                </span>
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="h-6 rounded-full border border-border/60 bg-muted/35 px-2.5 text-[11px] font-normal text-muted-foreground"
              >
                <HugeiconsIcon
                  icon={GlobalIcon}
                  className="mr-1.5 size-3.5"
                  strokeWidth={2}
                />
                All workspace
              </Badge>
            )}
          </div>
        </div>

        {thread && (
          <div className="flex items-center gap-1">
            <SidebarTrigger
              scope="inspector"
              className="[&_svg]:rotate-180"
              aria-label="Toggle inspector"
            />
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
          </div>
        )}
      </div>
    </div>
  )
}
