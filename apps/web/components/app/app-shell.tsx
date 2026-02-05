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
  Sun02Icon,
  Moon02Icon,
  InboxDownloadIcon,
  NotificationIcon,
} from "@hugeicons/core-free-icons";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
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
}

function ThemeToggleMenuItem() {
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <SidebarMenuButton
      onClick={() => setTheme(isDark ? "light" : "dark")}
      tooltip={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <HugeiconsIcon
        icon={isDark ? Sun02Icon : Moon02Icon}
        className="size-4"
      />
      <span>{isDark ? "Light mode" : "Dark mode"}</span>
    </SidebarMenuButton>
  );
}

export function AppShell({ children }: AppShellProps) {
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
  const isNotesRoute = pathname.startsWith("/app/notes");

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
              "--sidebar-width": "18rem",
              "--sidebar-width-mobile": "18rem",
            } as React.CSSProperties)
          : isNotesRoute
            ? ({
                "--sidebar-width": "20rem",
                "--sidebar-width-mobile": "18rem",
              } as React.CSSProperties)
            : undefined
      }
    >
      <Sidebar variant="floating" collapsible="icon">
        {isChatRoute && chatSidebarMode === "threads" ? (
          <ChatSidebar
            onBackToWorkspace={() => setChatSidebarMode("workspace")}
          />
        ) : isNotesRoute && notesSidebarMode === "notes" ? (
          <NotesAppSidebar
            onBackToWorkspace={() => setNotesSidebarMode("workspace")}
          />
        ) : (
          <>
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size="lg" asChild>
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
                              <HugeiconsIcon
                                icon={item.icon}
                                className="size-4"
                              />
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
                  <ThemeToggleMenuItem />
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SignOutButton />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </>
        )}
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="overflow-hidden">
        {!isChatRoute && (
          <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger />
            <div className="flex flex-1 items-center justify-between">
              <h1 className="text-sm font-medium">{pageTitle}</h1>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs">
                  <HugeiconsIcon icon={CommandIcon} className="size-3" />
                  <span className="hidden sm:inline">Search</span>
                  <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </Button>
              </div>
            </div>
          </header>
        )}
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 overflow-hidden">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );

  if (isNotesRoute) {
    return <NotesProvider>{shell}</NotesProvider>;
  }

  return shell;
}
