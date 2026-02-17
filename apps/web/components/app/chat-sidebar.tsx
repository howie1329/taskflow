"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { ThreadsRail } from "@/app/app/chat/components/threads-rail";
import {
  convertToChatThread,
  type ChatThread,
} from "@/app/app/chat/components/mock-data";
import { useThreads } from "@/hooks/use-threads";
import { useTheme } from "next-themes";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";

interface ChatSidebarProps {
  onBackToWorkspace?: () => void;
}

export function ChatSidebar({ onBackToWorkspace }: ChatSidebarProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [deleteThreadId, setDeleteThreadId] = useState<string | null>(null);
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Fetch threads from Convex
  const {
    threads: convexThreads,
    updateTitle,
    togglePin,
    softDelete,
  } = useThreads();

  // Convert Convex threads to ChatThread format
  const threads = convexThreads.map(convertToChatThread);

  const { state, isMobile, setOpen } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;

  const isNewChat = pathname === "/app/chat";
  const activeThreadId = isNewChat ? null : pathname.split("/").pop() || null;

  // Fetch real projects from Convex
  const projects = useQuery(api.projects.listMyProjects, { status: "active" });

  const filteredThreads = threads.filter(
    (thread) =>
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.snippet.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Pinned section: ALL pinned threads (with or without projects)
  const pinnedThreads = filteredThreads.filter((thread) => thread.pinned);

  // Recent section: Non-pinned threads WITHOUT projects
  const recentThreads = filteredThreads.filter(
    (thread) => !thread.pinned && !thread.projectId,
  );

  // Convert Convex projects to ChatProject format
  const chatProjects =
    projects?.map((project: Doc<"projects">) => ({
      id: project._id,
      title: project.title,
      icon: project.icon,
    })) ?? [];

  // Project groups: Non-pinned threads grouped by their projects
  const groupedByProject =
    projects
      ?.map((project: Doc<"projects">) => ({
        project: {
          id: project._id,
          title: project.title,
          icon: project.icon,
        },
        threads: filteredThreads.filter(
          (thread) => thread.projectId === project._id && !thread.pinned,
        ),
      }))
      .filter((group: { threads: ChatThread[] }) => group.threads.length > 0) ??
    [];

  const handleStartEdit = (thread: ChatThread) => {
    setEditingThreadId(thread.id);
    setEditingTitle(thread.title);
  };

  const handleCommitEdit = async () => {
    if (!editingThreadId) return;

    const trimmedTitle = editingTitle.trim() || "Untitled chat";

    try {
      await updateTitle({
        threadId: editingThreadId,
        title: trimmedTitle,
      });
    } catch (error) {
      console.error("Failed to update thread title:", error);
    }

    setEditingThreadId(null);
  };

  const handleCancelEdit = () => {
    setEditingThreadId(null);
  };

  const handleTogglePin = async (threadId: string) => {
    const thread = threads.find((t) => t.id === threadId);
    if (!thread) return;

    try {
      await togglePin({
        threadId,
        pinned: !thread.pinned,
      });
    } catch (error) {
      console.error("Failed to toggle pin:", error);
    }
  };

  const handleDeleteThread = async () => {
    if (!deleteThreadId) return;

    try {
      await softDelete({
        threadId: deleteThreadId,
      });
    } catch (error) {
      console.error("Failed to delete thread:", error);
    }

    setDeleteThreadId(null);
  };

  if (isCollapsed) {
    return (
      <>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Open sidebar"
                onClick={() => setOpen(true)}
                className="justify-center"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
                <span>Open sidebar</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Search threads"
                onClick={() => setOpen(true)}
                className="justify-center"
              >
                <HugeiconsIcon icon={SearchIcon} className="size-4" strokeWidth={2} />
                <span>Search threads</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="New chat"
                isActive={isNewChat}
                className={cn(
                  "justify-center",
                  isNewChat && "bg-sidebar-accent text-sidebar-accent-foreground",
                )}
              >
                <Link href="/app/chat" aria-label="New chat">
                  <HugeiconsIcon icon={PlusSignIcon} className="size-4" strokeWidth={2} />
                  <span>New chat</span>
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
                  className="size-4"
                />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <AlertDialog
          open={!!deleteThreadId}
          onOpenChange={(open) => !open && setDeleteThreadId(null)}
        >
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The conversation will be removed
                from your history.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteThreadId(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={handleDeleteThread}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-1">
              <SidebarMenuButton
                tooltip="Back to workspace"
                onClick={onBackToWorkspace}
                className="flex-1"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
                <span>Back to workspace</span>
              </SidebarMenuButton>
              <SidebarTrigger className="size-8 shrink-0" />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="min-w-0 px-0 overflow-hidden">
        <ThreadsRail
          className="w-full"
          variant="sidebar"
          isNewChat={isNewChat}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          threads={threads}
          filteredThreads={filteredThreads}
          pinnedThreads={pinnedThreads}
          recentThreads={recentThreads}
          groupedByProject={groupedByProject}
          projects={chatProjects}
          activeThreadId={activeThreadId}
          editingThreadId={editingThreadId}
          editingTitle={editingTitle}
          onEditTitleChange={setEditingTitle}
          onStartEdit={handleStartEdit}
          onCancelEdit={handleCancelEdit}
          onCommitEdit={handleCommitEdit}
          onTogglePin={handleTogglePin}
          onDeleteRequest={setDeleteThreadId}
        />
      </SidebarContent>
      <AlertDialog
        open={!!deleteThreadId}
        onOpenChange={(open) => !open && setDeleteThreadId(null)}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The conversation will be removed
              from your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteThreadId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteThread}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
