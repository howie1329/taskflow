"use client"

import { useState } from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PlusSignIcon,
  SearchIcon,
  SidebarLeftIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { AccountMenu } from "@/components/auth/sign-out-button"
import {
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  WorkspaceNavCommand,
  type WorkspaceNavCommandItem,
} from "@/components/app/workspace-nav-command"

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
  onOpenWorkspacePanel: () => void
  onOpenInspectorPanel: () => void
  primaryOpen: boolean
  inspectorOpen: boolean
  /** When true, hide strip on small screens (e.g. Chat uses its own mobile header). */
  hideMobileBar?: boolean
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
  onOpenWorkspacePanel,
  onOpenInspectorPanel,
  primaryOpen,
  inspectorOpen,
  hideMobileBar,
}: WorkspaceHeaderStripProps) {
  const { isMobile } = useSidebar()
  const [commandOpen, setCommandOpen] = useState(false)

  return (
    <>
      <WorkspaceNavCommand
        open={commandOpen}
        onOpenChange={setCommandOpen}
        items={commandItems}
      />

      <header
        className={cn(
          "z-20 flex min-h-10 shrink-0 items-center gap-2 border-b border-border/50 bg-background/80 px-2 py-1.5 backdrop-blur-md supports-backdrop-filter:bg-background/60 md:px-3",
          hideMobileBar && "hidden md:flex",
        )}
      >
        <button
          type="button"
          onClick={onOpenWorkspacePanel}
          className={cn(
            "text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground inline-flex max-w-[40%] min-w-0 items-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-left text-[11px] font-medium transition-colors md:max-w-[min(280px,45%)]",
            primaryOpen && "border-border bg-accent/40 text-foreground",
          )}
          aria-expanded={primaryOpen}
          aria-controls="workspace-primary-panel"
        >
          <HugeiconsIcon
            icon={SidebarLeftIcon}
            className="size-3.5 shrink-0 opacity-70"
            strokeWidth={2}
          />
          <span className="truncate">{pageTitle}</span>
        </button>

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

        {showInspector ? (
          <button
            type="button"
            onClick={onOpenInspectorPanel}
            className={cn(
              "text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground inline-flex max-w-[min(140px,28vw)] shrink-0 items-center gap-1.5 truncate rounded-md border border-transparent px-2 py-1 text-[11px] font-medium transition-colors",
              inspectorOpen && "border-border bg-accent/40 text-foreground",
            )}
            aria-expanded={inspectorOpen}
            aria-controls="workspace-inspector-panel"
          >
            <span className="truncate">{inspectorLabel}</span>
          </button>
        ) : null}

        <SidebarMenuButton
          size="sm"
          className="size-8 shrink-0 rounded-md"
          tooltip="Search"
          onClick={() => setCommandOpen(true)}
        >
          <HugeiconsIcon icon={SearchIcon} className="shrink-0" strokeWidth={2} />
          <span className="sr-only">Search</span>
        </SidebarMenuButton>

        <SidebarMenuButton
          size="sm"
          asChild
          tooltip="New task"
          className="size-8 shrink-0 rounded-md"
        >
          <Link href="/app/tasks" aria-label="New task">
            <HugeiconsIcon
              icon={PlusSignIcon}
              className="size-3 shrink-0"
              strokeWidth={2}
            />
            <span className="sr-only">New task</span>
          </Link>
        </SidebarMenuButton>

        <div className="flex shrink-0 items-center">
          <AccountMenu triggerVariant="icon" />
        </div>

        {isMobile ? (
          <SidebarTrigger className="shrink-0 md:hidden" aria-label="Open workspace" />
        ) : null}
      </header>
    </>
  )
}
