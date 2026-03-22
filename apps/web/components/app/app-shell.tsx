"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Task01Icon,
  FolderManagementIcon,
  MessageQuestionIcon,
  NoteIcon,
  SettingsIcon,
  CommandIcon,
  SidebarLeftIcon,
  InboxDownloadIcon,
  NotificationIcon,
} from "@hugeicons/core-free-icons";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { useViewer } from "@/components/settings/hooks/use-viewer";
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
} from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/app/chat-sidebar";
import { NotesAppSidebar } from "@/components/app/notes-app-sidebar";
import { NotesProvider } from "@/components/notes";
import { cn } from "@/lib/utils";
import { ChatInspectorProvider } from "@/components/app/chat-inspector-context";

const navItems = [
  {
    title: "Inbox",
    href: "/app/inbox",
    icon: InboxDownloadIcon,
  },
  {
    title: "Notifications",
    href: "/app/notifications",
    icon: NotificationIcon,
  },
  {
    title: "Tasks",
    href: "/app/tasks",
    icon: Task01Icon,
  },
  {
    title: "Projects",
    href: "/app/projects",
    icon: FolderManagementIcon,
  },
  {
    title: "AI Chat",
    href: "/app/chat",
    icon: MessageQuestionIcon,
  },
  {
    title: "Notes",
    href: "/app/notes",
    icon: NoteIcon,
  },
  {
    title: "Settings",
    href: "/app/settings",
    icon: SettingsIcon,
  },
];

function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/app/projects/")) return "Projects";
  if (pathname.startsWith("/app/chat/")) return "AI Chat";
  if (pathname.startsWith("/app/notes/")) return "Notes";
  const item = navItems.find((item) => pathname === item.href);
  if (item) return item.title;
  if (pathname === "/app") return "Overview";
  return "Taskflow";
}

interface AppShellProps {
  children: React.ReactNode;
  right?: React.ReactNode;
}

interface WorkspaceSidebarContentProps {
  pathname: string;
  isChatRoute: boolean;
  isNotesRoute: boolean;
  setChatSidebarMode: React.Dispatch<
    React.SetStateAction<"threads" | "workspace">
  >;
  setNotesSidebarMode: React.Dispatch<
    React.SetStateAction<"notes" | "workspace">
  >;
}

function WorkspaceSidebarContent({
  pathname,
  isChatRoute,
  isNotesRoute,
  setChatSidebarMode,
  setNotesSidebarMode,
}: WorkspaceSidebarContentProps) {
  const { state, isMobile, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;

  return (
    <>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {isCollapsed ? (
              <SidebarMenuButton
                size="lg"
                tooltip="Open sidebar"
                className="group/sidebar-toggle text-sidebar-foreground"
                onClick={toggleSidebar}
              >
                <div className="relative flex aspect-square size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <HugeiconsIcon
                    icon={CommandIcon}
                    className="size-3 transition-opacity duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/sidebar-toggle:opacity-0"
                  />
                  <HugeiconsIcon
                    icon={SidebarLeftIcon}
                    className="absolute size-3 opacity-0 transition-opacity duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/sidebar-toggle:opacity-100"
                  />
                </div>
                <span className="sr-only">Open sidebar</span>
              </SidebarMenuButton>
            ) : (
              <div className="flex items-center gap-1.5">
                <SidebarMenuButton
                  size="lg"
                  asChild
                  className="flex-1 text-sidebar-foreground"
                >
                  <Link href="/app">
                    <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                      <HugeiconsIcon icon={CommandIcon} className="size-3" />
                    </div>
                    <div className="grid min-w-0 flex-1 text-left text-xs leading-tight">
                      <span className="truncate font-semibold">Taskflow</span>
                      <span className="truncate text-[10px] text-muted-foreground">
                        Workspace
                      </span>
                    </div>
                  </Link>
                </SidebarMenuButton>
                <SidebarTrigger className="size-8 shrink-0" />
              </div>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isChatItem = item.href === "/app/chat";
                const isNotesItem = item.href === "/app/notes";
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                const handleChatClick =
                  isChatRoute && isChatItem
                    ? (event: React.MouseEvent<HTMLAnchorElement>) => {
                      event.preventDefault();
                      setChatSidebarMode("threads");
                    }
                    : undefined;
                const handleNotesClick =
                  isNotesRoute && isNotesItem
                    ? (event: React.MouseEvent<HTMLAnchorElement>) => {
                      event.preventDefault();
                      setNotesSidebarMode("notes");
                    }
                    : undefined;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
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
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SignOutButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}

function InspectorPanelContent({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  const { isMobile, open, openMobile } = useSidebar("inspector");
  const inspectorOpen = isMobile ? openMobile : open;

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
  );
}

export function AppShell({ children, right }: AppShellProps) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const router = useRouter();
  const { isLoading, preferences } = useViewer();
  const [chatSidebarMode, setChatSidebarMode] = useState<
    "threads" | "workspace"
  >("threads");
  const [notesSidebarMode, setNotesSidebarMode] = useState<
    "notes" | "workspace"
  >("notes");

  const isOnboardingRoute = pathname === "/app/onboarding";
  const isOnboarded = !!preferences?.onboardingCompletedAt;
  const isChatRoute = pathname.startsWith("/app/chat");
  const isChatThreadRoute = isChatRoute && pathname !== "/app/chat";
  const isNotesRoute = pathname.startsWith("/app/notes");
  const isTasksRoute = pathname.startsWith("/app/tasks");
  const isSettingsRoute = pathname.startsWith("/app/settings");
  const showInspector =
    !isOnboardingRoute && !isSettingsRoute && (isChatRoute || isNotesRoute);

  useEffect(() => {
    if (isLoading) return;
    if (!isOnboarded && !isOnboardingRoute) {
      router.replace("/app/onboarding");
    }
  }, [isLoading, isOnboarded, isOnboardingRoute, router]);

  useEffect(() => {
    if (isChatRoute) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset left sidebar mode when entering chat routes
      setChatSidebarMode("threads");
    }
  }, [isChatRoute]);

  useEffect(() => {
    if (isNotesRoute) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset left sidebar mode when entering notes routes
      setNotesSidebarMode("notes");
    }
  }, [isNotesRoute]);

  if (!isOnboardingRoute && !isOnboarded) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        {isLoading ? "Loading..." : "Redirecting to onboarding..."}
      </div>
    );
  }

  const shell = (
    <SidebarProvider
      defaultOpenInspector={false}
      className={cn(isChatRoute && "h-svh overflow-hidden")}
    >
      <Sidebar scope="primary" variant="sidebar" collapsible="icon">
        {isChatRoute && chatSidebarMode === "threads" ? (
          <ChatSidebar
            onBackToWorkspace={() => setChatSidebarMode("workspace")}
          />
        ) : isNotesRoute && notesSidebarMode === "notes" ? (
          <NotesAppSidebar
            onBackToWorkspace={() => setNotesSidebarMode("workspace")}
          />
        ) : (
          <WorkspaceSidebarContent
            pathname={pathname}
            isChatRoute={isChatRoute}
            isNotesRoute={isNotesRoute}
            setChatSidebarMode={setChatSidebarMode}
            setNotesSidebarMode={setNotesSidebarMode}
          />
        )}
        <SidebarRail scope="primary" />
      </Sidebar>
      <SidebarInset
        className={cn("min-w-0 overflow-hidden", isChatRoute && "min-h-0")}
      >
        {!isOnboardingRoute && !isChatRoute && (
          <div className="md:hidden sticky top-0 z-20 flex h-10 items-center gap-2 px-2 bg-background/70 backdrop-blur supports-backdrop-filter:bg-background/50">
            <SidebarTrigger className="-ml-1" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[11px] font-medium text-muted-foreground">
                {pageTitle}
              </div>
            </div>
            {showInspector ? (
              <SidebarTrigger
                scope="inspector"
                className="[&_svg]:rotate-180"
                aria-label="Open inspector"
              />
            ) : (
              <div className="w-7" aria-hidden="true" />
            )}
          </div>
        )}
        <main
          className={
            isTasksRoute || isNotesRoute
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
      {showInspector && (
        <Sidebar
          scope="inspector"
          side="right"
          variant="sidebar"
          collapsible="offcanvas"
          className={cn(
            "border-l border-border/60 bg-background/95 supports-backdrop-filter:bg-background/90",
            isChatRoute && "bg-background",
          )}
          style={
            {
              "--sidebar-width": isChatRoute ? "28rem" : "22rem",
              "--sidebar-width-mobile": isChatRoute ? "28rem" : "22rem",
            } as React.CSSProperties
          }
        >
          <SidebarHeader
            className={cn(
              "border-b border-border/50 px-4 py-3",
              isChatRoute && "border-b-0 pb-2",
            )}
          >
            <div className="flex min-h-8 items-center justify-between">
              <div className="min-w-0">
                <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  {isChatRoute ? "Dossier" : "Inspector"}
                </span>
              </div>
              <SidebarTrigger scope="inspector" aria-label="Close inspector" />
            </div>
          </SidebarHeader>
          <SidebarContent className={cn("p-4 pt-2", isChatRoute && "pt-0")}>
            <InspectorPanelContent>
              <div className="min-h-0 flex-1 overflow-y-auto">{right}</div>
            </InspectorPanelContent>
          </SidebarContent>
          <SidebarRail scope="inspector" />
        </Sidebar>
      )}
    </SidebarProvider>
  );

  if (isNotesRoute) {
    return (
      <ChatInspectorProvider>
        <NotesProvider>{shell}</NotesProvider>
      </ChatInspectorProvider>
    );
  }

  return <ChatInspectorProvider>{shell}</ChatInspectorProvider>;
}
