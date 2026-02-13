"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
  setChatSidebarMode: React.Dispatch<React.SetStateAction<"threads" | "workspace">>;
  setNotesSidebarMode: React.Dispatch<React.SetStateAction<"notes" | "workspace">>;
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
                className="group/sidebar-toggle"
                onClick={toggleSidebar}
              >
                <div className="relative flex aspect-square size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <HugeiconsIcon
                    icon={CommandIcon}
                    className="size-4 transition-opacity group-hover/sidebar-toggle:opacity-0"
                  />
                  <HugeiconsIcon
                    icon={SidebarLeftIcon}
                    className="absolute size-4 opacity-0 transition-opacity group-hover/sidebar-toggle:opacity-100"
                  />
                </div>
                <span className="sr-only">Open sidebar</span>
              </SidebarMenuButton>
            ) : (
              <div className="flex items-center gap-1">
                <SidebarMenuButton size="lg" asChild className="flex-1">
                  <Link href="/app">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                      <HugeiconsIcon icon={CommandIcon} className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">Taskflow</span>
                      <span className="truncate text-xs text-muted-foreground">
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
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
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
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.href} onClick={handleChatClick ?? handleNotesClick}>
                        <HugeiconsIcon icon={item.icon} className="size-4" />
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

const shouldIgnoreShortcut = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement | null;
  if (!target) return false;
  if (target.isContentEditable) return true;
  return !!target.closest('input, textarea, select, [contenteditable="true"]');
};

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
  const [isRightOpen, setIsRightOpen] = useState(false);
  const [isRightMobileOpen, setIsRightMobileOpen] = useState(false);

  const isOnboardingRoute = pathname === "/app/onboarding";
  const isOnboarded = !!preferences?.onboardingCompletedAt;
  const isChatRoute = pathname.startsWith("/app/chat");
  const isNotesRoute = pathname.startsWith("/app/notes");
  const isTasksRoute = pathname.startsWith("/app/tasks"); // Not used can be removed. Could be used for future tasks sidebar.
  const isSettingsRoute = pathname.startsWith("/app/settings");
  const hasRightSlot = pathname.startsWith("/app/chat/");

  useEffect(() => {
    if (isLoading) return;
    if (!isOnboarded && !isOnboardingRoute) {
      router.replace("/app/onboarding");
    }
  }, [isLoading, isOnboarded, isOnboardingRoute, router]);

  useEffect(() => {
    if (isChatRoute) {
      setChatSidebarMode("threads");
    }
  }, [isChatRoute]);

  useEffect(() => {
    if (isNotesRoute) {
      setNotesSidebarMode("notes");
    }
  }, [isNotesRoute]);

  useEffect(() => {
    if (!hasRightSlot) {
      setIsRightOpen(false);
      setIsRightMobileOpen(false);
    }
  }, [hasRightSlot, pathname]);

  useEffect(() => {
    if (!hasRightSlot) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "i") {
        return;
      }

      if (shouldIgnoreShortcut(event)) return;

      event.preventDefault();
      setIsRightOpen((open) => !open);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasRightSlot]);

  if (!isOnboardingRoute && !isOnboarded) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        {isLoading ? "Loading..." : "Redirecting to onboarding..."}
      </div>
    );
  }

  const shell = (
    <SidebarProvider
      style={
        isChatRoute
          ? ({
            "--sidebar-width": "16rem",
            "--sidebar-width-mobile": "18rem",
          } as React.CSSProperties)
          : isNotesRoute
            ? ({
              "--sidebar-width": "16rem",
              "--sidebar-width-mobile": "18rem",
            } as React.CSSProperties)
            : undefined
      }
    >
      <Sidebar
        variant="sidebar"
        collapsible="icon"
        className={isNotesRoute ? "border-r border-border/40" : undefined}
      >
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
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="min-w-0 overflow-hidden">
        {!isOnboardingRoute && (
          <div className="md:hidden sticky top-0 z-20 flex h-10 items-center gap-2 px-2 bg-background/70 backdrop-blur supports-backdrop-filter:bg-background/50">
            <SidebarTrigger className="-ml-1" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[11px] font-medium text-muted-foreground">
                {pageTitle}
              </div>
            </div>
            {hasRightSlot ? (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsRightMobileOpen(true)}
                aria-label="Open inspector"
              >
                <HugeiconsIcon icon={SidebarLeftIcon} className="size-4 rotate-180" />
              </Button>
            ) : (
              <div className="w-7" aria-hidden="true" />
            )}
          </div>
        )}
        <main
          className={
            isTasksRoute || isNotesRoute
              ? "relative flex flex-1 flex-col overflow-hidden"
              : isSettingsRoute
                ? "relative flex flex-1 flex-col overflow-hidden"
                : "relative flex flex-1 flex-col gap-2 overflow-hidden p-2 md:gap-2 md:p-2"
          }
        >
          {hasRightSlot && !isRightOpen && (
            <div className="pointer-events-none absolute right-3 top-3 z-20 hidden md:flex">
              <Button
                variant="outline"
                size="icon-sm"
                className="pointer-events-auto"
                onClick={() => setIsRightOpen(true)}
                aria-label="Open inspector"
              >
                <HugeiconsIcon icon={SidebarLeftIcon} className="size-4 rotate-180" />
              </Button>
            </div>
          )}
          {children}
        </main>
      </SidebarInset>
      {hasRightSlot && isRightOpen && (
        <aside className="hidden h-svh w-[22rem] shrink-0 flex-col border-l border-border/40 bg-background md:flex">
          <div className="flex h-11 items-center justify-between border-b border-border/40 px-3">
            <span className="text-sm font-medium">Inspector</span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsRightOpen(false)}
              aria-label="Close inspector"
            >
              <HugeiconsIcon icon={SidebarLeftIcon} className="size-4" />
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{right}</div>
        </aside>
      )}
      {hasRightSlot && (
        <Sheet open={isRightMobileOpen} onOpenChange={setIsRightMobileOpen}>
          <SheetContent side="right" className="w-[22rem] p-0 sm:w-[22rem]">
            <SheetHeader className="border-b border-border/40 px-4 py-3">
              <SheetTitle>Inspector</SheetTitle>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">{right}</div>
          </SheetContent>
        </Sheet>
      )}
    </SidebarProvider>
  );

  if (isNotesRoute) {
    return <NotesProvider>{shell}</NotesProvider>;
  }

  return shell;
}
