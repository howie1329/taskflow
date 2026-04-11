"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  Delete02Icon,
  Layers01Icon,
  MoreHorizontalIcon,
  PencilEdit01Icon,
  PinIcon,
  SidebarLeftIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { AccountMenu } from "@/components/auth/sign-out-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  WorkspaceNavCommand,
  type WorkspaceNavCommandItem,
} from "@/components/app/workspace-nav-command"
import { useWorkspaceChrome } from "@/components/app/workspace-chrome-context"
import { useIsMobile } from "@/hooks/use-mobile"
import { SHORTCUT_DISPLAY, SHORTCUT_HINT } from "@/lib/keyboard-shortcuts"

type WorkspaceHeaderStripProps = {
  pageTitle: string
  showInspector: boolean
  inspectorLabel: "Dossier" | "Inspector"
  isChatRoute: boolean
  isNotesRoute: boolean
  chatSidebarMode: "threads" | "workspace"
  notesSidebarMode: "notes" | "workspace"
  onChatModeChange: (mode: "threads" | "workspace") => void
  onNotesModeChange: (mode: "notes" | "workspace") => void
  commandItems: WorkspaceNavCommandItem[]
  onToggleWorkspacePanel: () => void
  onToggleInspectorPanel: () => void
  primaryOpen: boolean
  inspectorOpen: boolean
}

export function WorkspaceHeaderStrip({
  pageTitle,
  showInspector,
  inspectorLabel,
  isChatRoute,
  isNotesRoute,
  chatSidebarMode,
  notesSidebarMode,
  onChatModeChange,
  onNotesModeChange,
  commandItems,
  onToggleWorkspacePanel,
  onToggleInspectorPanel,
  primaryOpen,
  inspectorOpen,
}: WorkspaceHeaderStripProps) {
  const [commandOpen, setCommandOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const isMobile = useIsMobile()
  const { chatThreadActions, noteDetailChrome } = useWorkspaceChrome()
  const isChatThreadRoute = pathname.startsWith("/app/chat/")
  const isNoteDetailRoute = /^\/app\/notes\/[^/]+$/.test(pathname)

  return (
    <>
      <WorkspaceNavCommand
        open={commandOpen}
        onOpenChange={setCommandOpen}
        items={commandItems}
      />

      <header
        className="z-20 flex min-h-10 shrink-0 items-center gap-2 border-b border-border/50 bg-background/80 px-2 py-1.5 backdrop-blur-md supports-backdrop-filter:bg-background/60 md:px-3"
      >
        {isChatThreadRoute && isMobile ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 md:hidden"
            onClick={() => router.push("/app/chat")}
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              className="size-4"
              strokeWidth={2}
            />
            <span className="sr-only">Back to chats</span>
          </Button>
        ) : null}

        {isNoteDetailRoute && isMobile ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 md:hidden"
            onClick={() => router.push("/app/notes")}
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              className="size-4"
              strokeWidth={2}
            />
            <span className="sr-only">Back to notes</span>
          </Button>
        ) : null}

        {noteDetailChrome ? (
          <div className="flex min-w-0 max-w-[min(100%,340px)] flex-1 items-center gap-1 sm:max-w-[min(100%,min(400px,52vw))]">
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={onToggleWorkspacePanel}
                className={cn(
                  "text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-transparent transition-colors",
                  primaryOpen && "border-border bg-accent/40 text-foreground",
                )}
                aria-expanded={primaryOpen}
                aria-controls="workspace-primary-panel"
                aria-keyshortcuts="Meta+B"
                title={`Toggle workspace panel (${SHORTCUT_HINT.toggleSidebar})`}
              >
                <HugeiconsIcon
                  icon={SidebarLeftIcon}
                  className="size-3.5 shrink-0 opacity-70"
                  strokeWidth={2}
                />
                <span className="sr-only">Toggle workspace panel</span>
              </button>
              <Kbd className="hidden h-5 text-[10px] md:inline-flex">
                {SHORTCUT_DISPLAY.toggleSidebar}
              </Kbd>
            </div>
            <Input
              key={noteDetailChrome.noteId}
              defaultValue={noteDetailChrome.defaultTitle}
              onChange={(e) => noteDetailChrome.onTitleChange(e.target.value)}
              onBlur={(e) => noteDetailChrome.onTitleBlur(e.target.value)}
              placeholder="Note title"
              className="h-8 min-w-0 flex-1 border-0 bg-transparent px-1 py-0 text-[11px] font-medium shadow-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={onToggleWorkspacePanel}
            className={cn(
              "text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground inline-flex max-w-[40%] min-w-0 items-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-left text-[11px] font-medium transition-colors md:max-w-[min(280px,45%)]",
              primaryOpen && "border-border bg-accent/40 text-foreground",
            )}
            aria-expanded={primaryOpen}
            aria-controls="workspace-primary-panel"
            aria-keyshortcuts="Meta+B"
            title={`Toggle workspace panel (${SHORTCUT_HINT.toggleSidebar})`}
          >
            <HugeiconsIcon
              icon={SidebarLeftIcon}
              className="size-3.5 shrink-0 opacity-70"
              strokeWidth={2}
            />
            <span className="truncate">{pageTitle}</span>
            <Kbd className="hidden h-5 text-[10px] md:inline-flex">
              {SHORTCUT_DISPLAY.toggleSidebar}
            </Kbd>
          </button>
        )}

        {isChatRoute ? (
          <div
            className="hidden shrink-0 items-center rounded-md border border-border/60 p-0.5 sm:flex"
            role="group"
            aria-label="Chat sidebar mode"
          >
            <Button
              type="button"
              variant={chatSidebarMode === "workspace" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 rounded-sm px-2 text-[10px]"
              onClick={() => onChatModeChange("workspace")}
            >
              Workspace
            </Button>
            <Button
              type="button"
              variant={chatSidebarMode === "threads" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 rounded-sm px-2 text-[10px]"
              onClick={() => onChatModeChange("threads")}
            >
              Threads
            </Button>
          </div>
        ) : null}

        {isNotesRoute ? (
          <div
            className="hidden shrink-0 items-center rounded-md border border-border/60 p-0.5 sm:flex"
            role="group"
            aria-label="Notes sidebar mode"
          >
            <Button
              type="button"
              variant={notesSidebarMode === "workspace" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 rounded-sm px-2 text-[10px]"
              onClick={() => onNotesModeChange("workspace")}
            >
              Workspace
            </Button>
            <Button
              type="button"
              variant={notesSidebarMode === "notes" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 rounded-sm px-2 text-[10px]"
              onClick={() => onNotesModeChange("notes")}
            >
              Notes
            </Button>
          </div>
        ) : null}

        <div className="min-w-0 flex-1" />

        {noteDetailChrome ? (
          <div className="flex shrink-0 items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={noteDetailChrome.onTogglePin}
              className={cn(noteDetailChrome.pinned && "text-primary")}
              title={noteDetailChrome.pinned ? "Unpin note" : "Pin note"}
            >
              <HugeiconsIcon icon={PinIcon} className="size-4" strokeWidth={2} />
            </Button>
            {noteDetailChrome.moreMenu}
          </div>
        ) : null}

        {isChatThreadRoute && chatThreadActions ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="shrink-0"
              >
                <HugeiconsIcon
                  icon={MoreHorizontalIcon}
                  className="size-4"
                  strokeWidth={2}
                />
                <span className="sr-only">Conversation actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={chatThreadActions.onEditTitle}>
                <HugeiconsIcon
                  icon={PencilEdit01Icon}
                  className="mr-2 size-4"
                  strokeWidth={2}
                />
                Edit title
              </DropdownMenuItem>
              {chatThreadActions.onCompactChat ? (
                <DropdownMenuItem
                  onClick={() => void chatThreadActions.onCompactChat?.()}
                >
                  <HugeiconsIcon
                    icon={Layers01Icon}
                    className="mr-2 size-4"
                    strokeWidth={2}
                  />
                  Compact chat
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={chatThreadActions.onDelete}
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
        ) : null}

        {showInspector ? (
          <button
            type="button"
            onClick={onToggleInspectorPanel}
            className={cn(
              "text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground inline-flex max-w-[min(140px,28vw)] shrink-0 items-center gap-1.5 truncate rounded-md border border-transparent px-2 py-1 text-[11px] font-medium transition-colors",
              inspectorOpen && "border-border bg-accent/40 text-foreground",
            )}
            aria-expanded={inspectorOpen}
            aria-controls="workspace-inspector-panel"
            aria-keyshortcuts="Meta+I"
            title={`Toggle ${inspectorLabel.toLowerCase()} (${SHORTCUT_HINT.toggleInspector})`}
          >
            <span className="truncate">{inspectorLabel}</span>
            <Kbd className="hidden h-5 text-[10px] md:inline-flex">
              {SHORTCUT_DISPLAY.toggleInspector}
            </Kbd>
          </button>
        ) : null}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-muted-foreground h-8 shrink-0 gap-1.5 px-2.5 text-xs"
          onClick={() => setCommandOpen(true)}
          title={`Go to a page in the app (${SHORTCUT_HINT.goTo})`}
          aria-keyshortcuts="Meta+K"
        >
          <span className="hidden sm:inline">Go to</span>
          <Kbd className="font-mono text-[10px] leading-none">
            {SHORTCUT_DISPLAY.goTo}
          </Kbd>
          <span className="sr-only">Open go to menu</span>
        </Button>

        <div className="flex shrink-0 items-center">
          <AccountMenu triggerVariant="icon" />
        </div>
      </header>
    </>
  )
}
