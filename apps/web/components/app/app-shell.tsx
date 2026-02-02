"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { SignOutButton } from "@/components/auth/sign-out-button";
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

const navItems = [
  {
    title: "Inbox",
    href: "/app/inbox",
    icon: InboxDownloadIcon,
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

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/app">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-none bg-primary text-primary-foreground">
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
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <HugeiconsIcon icon={item.icon} className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
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
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
