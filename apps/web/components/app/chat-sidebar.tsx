"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Sun02Icon,
  Moon02Icon,
  SearchIcon,
  Cancel01Icon,
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
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { ThreadsRail } from "@/app/app/chat/components/threads-rail";
import {
  mockProjects,
  mockThreads,
  type ChatThread,
} from "@/app/app/chat/components/mock-data";
import { useTheme } from "next-themes";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  onBackToWorkspace?: () => void;
}

export function ChatSidebar({ onBackToWorkspace }: ChatSidebarProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [threads, setThreads] = useState<ChatThread[]>(mockThreads);
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [deleteThreadId, setDeleteThreadId] = useState<string | null>(null);
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;

  const isNewChat = pathname === "/app/chat";
  const activeThreadId = isNewChat ? null : pathname.split("/").pop() || null;

  const filteredThreads = threads.filter(
    (thread) =>
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.snippet.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const pinnedThreads = filteredThreads.filter(
    (thread) => thread.pinned && !thread.projectId,
  );
  const recentThreads = filteredThreads.filter(
    (thread) => !thread.pinned && !thread.projectId,
  );

  const groupedByProject = mockProjects
    .map((project) => ({
      project,
      threads: filteredThreads.filter(
        (thread) => thread.projectId === project.id,
      ),
    }))
    .filter((group) => group.threads.length > 0);

  const handleStartEdit = (thread: ChatThread) => {
    setEditingThreadId(thread.id);
    setEditingTitle(thread.title);
  };

  const handleCommitEdit = () => {
    if (!editingThreadId) return;
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === editingThreadId
          ? { ...thread, title: editingTitle.trim() || "Untitled chat" }
          : thread,
      ),
    );
    setEditingThreadId(null);
  };

  const handleCancelEdit = () => {
    setEditingThreadId(null);
  };

  const handleTogglePin = (threadId: string) => {
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId ? { ...thread, pinned: !thread.pinned } : thread,
      ),
    );
  };

  const handleDeleteThread = () => {
    if (!deleteThreadId) return;
    setThreads((prev) => prev.filter((thread) => thread.id !== deleteThreadId));
    setDeleteThreadId(null);
  };

  if (isCollapsed) {
    return (
      <>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Back to workspace"
                onClick={onBackToWorkspace}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
                <span>Back to workspace</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="px-2">
          <div className="space-y-2">
            <Link href="/app/chat">
              <Button
                className={cn(
                  "w-full h-7 rounded-md px-2 text-xs",
                  isNewChat && "bg-accent text-accent-foreground",
                )}
                variant={isNewChat ? "secondary" : "default"}
              >
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  className="size-3 mr-1"
                  strokeWidth={2}
                />
                New
              </Button>
            </Link>

            <InputGroup className="w-full">
              <InputGroupAddon>
                <HugeiconsIcon
                  icon={SearchIcon}
                  className="size-3.5"
                  strokeWidth={2}
                />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search threads..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
                className="h-7 text-xs"
              />
              {searchQuery && (
                <InputGroupAddon>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setSearchQuery("")}
                    className="h-5 w-5"
                  >
                    <HugeiconsIcon
                      icon={Cancel01Icon}
                      className="size-3"
                      strokeWidth={2}
                    />
                  </Button>
                </InputGroupAddon>
              )}
            </InputGroup>
          </div>
        </SidebarContent>

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
            <SidebarMenuButton
              tooltip="Back to workspace"
              onClick={onBackToWorkspace}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
              <span>Back to workspace</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-0 overflow-hidden">
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
