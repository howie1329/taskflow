"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"

import { useViewer } from "@/components/settings/hooks/use-viewer"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChatSidebar } from "@/components/app/chat-sidebar"
import { NotesAppSidebar } from "@/components/app/notes-app-sidebar"
import { NotesProvider } from "@/components/notes"
import { cn } from "@/lib/utils"
import { ChatInspectorProvider } from "@/components/app/chat-inspector-context"
import {
  buildWorkspaceCommandItems,
  getPageTitle,
  navPrimary,
  navTools,
  navWorkspace,
  settingsNavItem,
  type NavItemDef,
} from "@/lib/workspace-nav"
import { WorkspaceHeaderStrip } from "@/components/app/workspace-header-strip"
import {
  WorkspaceChromeProvider,
  useWorkspaceChrome,
} from "@/components/app/workspace-chrome-context"
import { useWorkspaceRouteCycle } from "@/hooks/use-workspace-route-cycle"
import { useIsMobile } from "@/hooks/use-mobile"
import { trackFloatingPanelOpen } from "@/lib/workspace-shell-analytics"

interface WorkspaceSidebarContentProps {
  pathname: string
  isChatRoute: boolean
  isNotesRoute: boolean
  setChatSidebarMode: React.Dispatch<
    React.SetStateAction<"threads" | "workspace">
  >
  setNotesSidebarMode: React.Dispatch<
    React.SetStateAction<"notes" | "workspace">
  >
}

function NavRows({
  items,
  pathname,
  isChatRoute,
  isNotesRoute,
  setChatSidebarMode,
  setNotesSidebarMode,
}: WorkspaceSidebarContentProps & { items: NavItemDef[] }) {
  return (
    <>
      {items.map((item) => {
        const isChatItem = item.href === "/app/chat"
        const isNotesItem = item.href === "/app/notes"
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`)
        const handleChatClick =
          isChatRoute && isChatItem
            ? (event: React.MouseEvent<HTMLAnchorElement>) => {
                event.preventDefault()
                setChatSidebarMode("threads")
              }
            : undefined
        const handleNotesClick =
          isNotesRoute && isNotesItem
            ? (event: React.MouseEvent<HTMLAnchorElement>) => {
                event.preventDefault()
                setNotesSidebarMode("notes")
              }
            : undefined

        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              variant="navPill"
              size="sm"
              tooltip={item.title}
            >
              <Link
                href={item.href}
                onClick={handleChatClick ?? handleNotesClick}
              >
                <HugeiconsIcon icon={item.icon} className="shrink-0" />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </>
  )
}

function WorkspaceSidebarContent({
  pathname,
  isChatRoute,
  isNotesRoute,
  setChatSidebarMode,
  setNotesSidebarMode,
}: WorkspaceSidebarContentProps) {
  const navProps: WorkspaceSidebarContentProps = {
    pathname,
    isChatRoute,
    isNotesRoute,
    setChatSidebarMode,
    setNotesSidebarMode,
  }

  return (
    <>
      <SidebarContent className="gap-0 px-0 pt-2">
        <SidebarGroup className="py-2">
          <SidebarGroupLabel className="sr-only">Primary</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavRows items={navPrimary} {...navProps} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Collapsible defaultOpen className="group border-t border-sidebar-border/40">
          <CollapsibleTrigger className="flex w-full items-center gap-1 rounded-md px-3 py-2 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wide outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent/40 hover:text-sidebar-foreground focus-visible:ring-2">
            <span>Workspace</span>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              className="ml-auto size-3 shrink-0 opacity-70 transition-transform group-data-[state=open]:rotate-180"
              strokeWidth={2}
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-2 pb-2">
              <SidebarMenu>
                <NavRows items={navWorkspace} {...navProps} />
              </SidebarMenu>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible defaultOpen className="group border-t border-sidebar-border/40">
          <CollapsibleTrigger className="flex w-full items-center gap-1 rounded-md px-3 py-2 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wide outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent/40 hover:text-sidebar-foreground focus-visible:ring-2">
            <span>Tools</span>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              className="ml-auto size-3 shrink-0 opacity-70 transition-transform group-data-[state=open]:rotate-180"
              strokeWidth={2}
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-2 pb-2">
              <SidebarMenu>
                <NavRows items={navTools} {...navProps} />
              </SidebarMenu>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/50 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="sm"
              variant="navPill"
              tooltip="Settings"
              className="text-sidebar-foreground/70"
            >
              <Link href={settingsNavItem.href}>
                <HugeiconsIcon icon={settingsNavItem.icon} className="shrink-0" strokeWidth={2} />
                <span>{settingsNavItem.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  )
}

function InspectorPanelContent({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion()
  const { isMobile, open, openMobile } = useSidebar("inspector")
  const inspectorOpen = isMobile ? openMobile : open

  return (
    <motion.div
      initial={false}
      animate={
        reduceMotion
          ? { opacity: 1, x: 0 }
          : inspectorOpen
            ? { opacity: 1, x: 0 }
            : { opacity: 0.72, x: 24 }
      }
      transition={{
        duration: reduceMotion ? 0 : inspectorOpen ? 0.24 : 0.18,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="min-h-0 flex-1 will-change-transform"
    >
      {children}
    </motion.div>
  )
}

interface AppShellProps {
  children: React.ReactNode
  right?: React.ReactNode
}

type AppShellInnerProps = {
  children: React.ReactNode
  right?: React.ReactNode
  pathname: string
  pageTitle: string
  isOnboardingRoute: boolean
  isChatRoute: boolean
  isChatThreadRoute: boolean
  isNotesRoute: boolean
  isTasksRoute: boolean
  isProjectsRoute: boolean
  isSettingsRoute: boolean
  showInspector: boolean
  chatSidebarMode: "threads" | "workspace"
  setChatSidebarMode: React.Dispatch<
    React.SetStateAction<"threads" | "workspace">
  >
  notesSidebarMode: "notes" | "workspace"
  setNotesSidebarMode: React.Dispatch<
    React.SetStateAction<"notes" | "workspace">
  >
}

function AppShellInner({
  children,
  right,
  pathname,
  pageTitle,
  isOnboardingRoute,
  isChatRoute,
  isChatThreadRoute,
  isNotesRoute,
  isTasksRoute,
  isProjectsRoute,
  isSettingsRoute,
  showInspector,
  chatSidebarMode,
  setChatSidebarMode,
  notesSidebarMode,
  setNotesSidebarMode,
}: AppShellInnerProps) {
  const { pageTitleOverride } = useWorkspaceChrome()
  const displayTitle = pageTitleOverride ?? pageTitle
  const isMobile = useIsMobile()
  const {
    open: primaryOpen,
    setOpen: setPrimaryOpen,
    openMobile: primaryOpenMobile,
    setOpenMobile: setPrimaryOpenMobile,
  } = useSidebar()
  const {
    open: inspectorOpen,
    setOpen: setInspectorOpen,
    openMobile: inspectorOpenMobile,
    setOpenMobile: setInspectorOpenMobile,
  } = useSidebar("inspector")

  const primaryExpanded = isMobile ? primaryOpenMobile : primaryOpen
  const inspectorExpanded = isMobile ? inspectorOpenMobile : inspectorOpen

  const commandItems = useMemo(() => buildWorkspaceCommandItems(), [])

  const inspectorLabel = isChatRoute ? "Dossier" : "Inspector"

  const toggleWorkspacePanel = () => {
    const next = !primaryExpanded
    trackFloatingPanelOpen("left", next)
    if (isMobile) {
      setPrimaryOpenMobile(next)
      return
    }
    if (next) setInspectorOpen(false)
    setPrimaryOpen(next)
  }

  const toggleInspectorPanel = () => {
    const next = !inspectorExpanded
    trackFloatingPanelOpen("right", next)
    if (isMobile) {
      setInspectorOpenMobile(next)
      return
    }
    if (next) setPrimaryOpen(false)
    setInspectorOpen(next)
  }

  const primaryPanelBody =
    isChatRoute && chatSidebarMode === "threads" ? (
      <ChatSidebar />
    ) : isNotesRoute && notesSidebarMode === "notes" ? (
      <NotesAppSidebar />
    ) : (
      <WorkspaceSidebarContent
        pathname={pathname}
        isChatRoute={isChatRoute}
        isNotesRoute={isNotesRoute}
        setChatSidebarMode={setChatSidebarMode}
        setNotesSidebarMode={setNotesSidebarMode}
      />
    )

  return (
    <>
      <Sidebar
        scope="primary"
        variant="inset"
        collapsible="offcanvas"
        className="z-10"
      >
        <div
          id="workspace-primary-panel"
          role="navigation"
          aria-label="Workspace"
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          {primaryPanelBody}
        </div>
        <SidebarRail scope="primary" />
      </Sidebar>

      <SidebarInset
        className={cn(
          "min-w-0 overflow-hidden",
          (isChatRoute ||
            isSettingsRoute ||
            isTasksRoute ||
            isNotesRoute ||
            isProjectsRoute) &&
            "min-h-0",
        )}
      >
        {!isOnboardingRoute ? (
          <WorkspaceHeaderStrip
            pageTitle={displayTitle}
            showInspector={showInspector}
            inspectorLabel={inspectorLabel}
            isChatRoute={isChatRoute}
            isNotesRoute={isNotesRoute}
            chatSidebarMode={chatSidebarMode}
            notesSidebarMode={notesSidebarMode}
            onChatModeChange={setChatSidebarMode}
            onNotesModeChange={setNotesSidebarMode}
            commandItems={commandItems}
            onToggleWorkspacePanel={toggleWorkspacePanel}
            onToggleInspectorPanel={toggleInspectorPanel}
            primaryOpen={primaryExpanded}
            inspectorOpen={inspectorExpanded}
          />
        ) : null}
        <main
          className={
            isTasksRoute || isNotesRoute || isProjectsRoute
              ? "relative flex min-h-0 flex-1 flex-col overflow-hidden"
              : isSettingsRoute
                ? "relative flex min-h-0 flex-1 flex-col overflow-hidden"
                : isChatThreadRoute
                  ? "relative flex min-h-0 flex-1 flex-col overflow-hidden px-2 pb-2"
                  : "relative flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-2 md:gap-2 md:p-2"
          }
        >
          {children}
        </main>
      </SidebarInset>

      {showInspector ? (
        <Sidebar
          scope="inspector"
          side="right"
          variant="inset"
          collapsible="offcanvas"
          className="z-10 border-0 bg-transparent shadow-none"
          style={
            {
              "--sidebar-width": isChatRoute ? "28rem" : "22rem",
              "--sidebar-width-mobile": isChatRoute ? "28rem" : "22rem",
            } as React.CSSProperties
          }
        >
          <div
            id="workspace-inspector-panel"
            role="complementary"
            aria-label={inspectorLabel}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            {isChatRoute || isNotesRoute ? null : (
              <SidebarHeader className="border-b border-border/50 px-4 py-3">
                <div className="flex min-h-8 items-center justify-between gap-3">
                  <div
                    id="workspace-inspector-heading"
                    className="min-w-0 truncate text-base font-semibold tracking-tight text-foreground"
                  >
                    {inspectorLabel}
                  </div>
                  <SidebarTrigger
                    scope="inspector"
                    aria-label={`Close ${inspectorLabel.toLowerCase()}`}
                  />
                </div>
              </SidebarHeader>
            )}
            <SidebarContent
              className={cn(
                "flex min-h-0 flex-1 flex-col overflow-hidden p-4",
                !isChatRoute && !isNotesRoute && "pt-3",
              )}
            >
              <InspectorPanelContent>
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                  {right}
                </div>
              </InspectorPanelContent>
            </SidebarContent>
          </div>
          <SidebarRail scope="inspector" />
        </Sidebar>
      ) : null}
    </>
  )
}

export function AppShell({ children, right }: AppShellProps) {
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)
  const router = useRouter()
  const { isLoading, preferences } = useViewer()
  const [chatSidebarMode, setChatSidebarMode] = useState<
    "threads" | "workspace"
  >("threads")
  const [notesSidebarMode, setNotesSidebarMode] = useState<
    "notes" | "workspace"
  >("notes")

  const isOnboardingRoute = pathname === "/app/onboarding"
  const isOnboarded = !!preferences?.onboardingCompletedAt
  const isChatRoute = pathname.startsWith("/app/chat")
  const isChatThreadRoute = isChatRoute && pathname !== "/app/chat"
  const isNotesRoute = pathname.startsWith("/app/notes")
  const isTasksRoute = pathname.startsWith("/app/tasks")
  const isProjectsRoute = pathname.startsWith("/app/projects")
  const isSettingsRoute = pathname.startsWith("/app/settings")
  const showInspector =
    !isOnboardingRoute && !isSettingsRoute && (isChatRoute || isNotesRoute)

  useWorkspaceRouteCycle(
    !isOnboardingRoute && isOnboarded && pathname.startsWith("/app"),
  )

  useEffect(() => {
    if (isLoading) return
    if (!isOnboarded && !isOnboardingRoute) {
      router.replace("/app/onboarding")
    }
  }, [isLoading, isOnboarded, isOnboardingRoute, router])

  useEffect(() => {
    if (isChatRoute) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset left sidebar mode when entering chat routes
      setChatSidebarMode("threads")
    }
  }, [isChatRoute])

  useEffect(() => {
    if (isNotesRoute) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset left sidebar mode when entering notes routes
      setNotesSidebarMode("notes")
    }
  }, [isNotesRoute])

  if (!isOnboardingRoute && !isOnboarded) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        {isLoading ? "Loading..." : "Redirecting to onboarding..."}
      </div>
    )
  }

  const shell = (
    <WorkspaceChromeProvider>
      <SidebarProvider
        defaultOpen={false}
        defaultOpenInspector={false}
        className={cn(
          (isChatRoute ||
            isTasksRoute ||
            isProjectsRoute ||
            isSettingsRoute) &&
            "h-svh overflow-hidden",
        )}
        style={
          {
            "--sidebar-width": "15rem",
            "--panel-w": "15rem",
          } as React.CSSProperties
        }
      >
        <AppShellInner
          right={right}
          pathname={pathname}
          pageTitle={pageTitle}
          isOnboardingRoute={isOnboardingRoute}
          isChatRoute={isChatRoute}
          isChatThreadRoute={isChatThreadRoute}
          isNotesRoute={isNotesRoute}
          isTasksRoute={isTasksRoute}
          isProjectsRoute={isProjectsRoute}
          isSettingsRoute={isSettingsRoute}
          showInspector={showInspector}
          chatSidebarMode={chatSidebarMode}
          setChatSidebarMode={setChatSidebarMode}
          notesSidebarMode={notesSidebarMode}
          setNotesSidebarMode={setNotesSidebarMode}
        >
          {children}
        </AppShellInner>
      </SidebarProvider>
    </WorkspaceChromeProvider>
  )

  if (isNotesRoute) {
    return (
      <ChatInspectorProvider>
        <NotesProvider>{shell}</NotesProvider>
      </ChatInspectorProvider>
    )
  }

  return <ChatInspectorProvider>{shell}</ChatInspectorProvider>
}
