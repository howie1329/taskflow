"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Sun02Icon,
  Moon02Icon,
  SearchIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ThreadsRail } from "@/app/app/chat/components/threads-rail";
import { convertToChatThread } from "@/app/app/chat/components/thread-types";
import { useThreads } from "@/hooks/use-threads";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { SHORTCUT_HINT, SHORTCUT_KEYS } from "@/lib/keyboard-shortcuts";
import { shouldIgnoreGlobalShortcut } from "@/lib/should-ignore-global-shortcut";

export function ChatSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [deleteThreadId, setDeleteThreadId] = useState<string | null>(null);
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const {
    threads: convexThreads,
    updateTitle,
    togglePin,
    softDelete,
  } = useThreads();
  const threads = convexThreads.map(convertToChatThread);

  const { state, isMobile, setOpen } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;

  const isNewChat = pathname === "/app/chat";
  const activeThreadId = isNewChat ? null : pathname.split("/").pop() || null;

  const rawProjects = useQuery(api.projects.listMyProjects, {
    status: "active",
  });
  const projects = (rawProjects ?? []).map((p: Doc<"projects">) => ({
    id: p._id,
    title: p.title,
    icon: p.icon,
  }));

  const handleRename = async (threadId: string, title: string) => {
    await updateTitle({ threadId, title });
  };

  const handleTogglePin = async (threadId: string, pinned: boolean) => {
    await togglePin({ threadId, pinned });
  };

  const handleDeleteThread = async () => {
    if (!deleteThreadId) return;
    await softDelete({ threadId: deleteThreadId });
    setDeleteThreadId(null);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.key.toLowerCase() !== SHORTCUT_KEYS.createNew) return;
      if (shouldIgnoreGlobalShortcut(event.target)) return;

      event.preventDefault();
      router.push("/app/chat");
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  const deleteDialog = (
    <AlertDialog
      open={!!deleteThreadId}
      onOpenChange={(open) => !open && setDeleteThreadId(null)}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The conversation will be removed from
            your history.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setDeleteThreadId(null)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDeleteThread}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  if (isCollapsed) {
    return (
      <>
        <SidebarHeader className="gap-1 border-b border-sidebar-border/50 px-1.5 py-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Open sidebar"
                onClick={() => setOpen(true)}
                className="justify-center"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="shrink-0" />
                <span>Open sidebar</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={`Search threads (${SHORTCUT_HINT.localSearch})`}
                onClick={() => setOpen(true)}
                className="justify-center"
              >
                <HugeiconsIcon icon={SearchIcon} className="shrink-0" strokeWidth={2} />
                <span>Search threads</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={`New chat (${SHORTCUT_HINT.createNew})`}
                isActive={isNewChat}
                className="justify-center"
              >
                <Link href="/app/chat" aria-label="New chat">
                  <HugeiconsIcon
                    icon={PlusSignIcon}
                    className="size-3 shrink-0"
                    strokeWidth={2}
                  />
                  <span className="sr-only">New chat</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="px-2" />

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setTheme(isDark ? "light" : "dark")}
                tooltip={
                  isDark ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                <HugeiconsIcon
                  icon={isDark ? Sun02Icon : Moon02Icon}
                  className="shrink-0"
                />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        {deleteDialog}
      </>
    );
  }

  return (
    <>
      <SidebarContent className="min-w-0 overflow-hidden px-0 pt-0">
        <ThreadsRail
          className="w-full"
          variant="sidebar"
          isNewChat={isNewChat}
          threads={threads}
          projects={projects}
          activeThreadId={activeThreadId}
          onRename={handleRename}
          onTogglePin={handleTogglePin}
          onDeleteRequest={setDeleteThreadId}
        />
      </SidebarContent>

      {deleteDialog}
    </>
  );
}
