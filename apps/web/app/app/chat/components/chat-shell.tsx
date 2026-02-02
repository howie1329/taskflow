"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlusSignIcon,
  SearchIcon,
  Cancel01Icon,
  PinIcon,
} from "@hugeicons/core-free-icons";

// Mock data types (will be extracted later)
interface ChatThread {
  id: string;
  title: string;
  snippet: string;
  updatedAt: number;
  pinned: boolean;
  projectId?: string;
}

interface ChatProject {
  id: string;
  title: string;
  icon: string;
}

// Mock data
const mockThreads: ChatThread[] = [
  {
    id: "t1",
    title: "Planning Q1 roadmap",
    snippet: "Let's break down the goals...",
    updatedAt: Date.now() - 1000 * 60 * 30,
    pinned: true,
  },
  {
    id: "t2",
    title: "Website redesign ideas",
    snippet: "Consider a darker theme...",
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
    pinned: true,
  },
  {
    id: "t3",
    title: "Task prioritization",
    snippet: "Here are the high priority items...",
    updatedAt: Date.now() - 1000 * 60 * 60 * 4,
    pinned: false,
  },
  {
    id: "t4",
    title: "Meeting notes summary",
    snippet: "Key takeaways from the sync...",
    updatedAt: Date.now() - 1000 * 60 * 60 * 24,
    pinned: false,
    projectId: "p1",
  },
  {
    id: "t5",
    title: "Bug triage help",
    snippet: "These are the critical bugs...",
    updatedAt: Date.now() - 1000 * 60 * 60 * 48,
    pinned: false,
    projectId: "p2",
  },
];

const mockProjects: ChatProject[] = [
  { id: "p1", title: "Website Redesign", icon: "🎨" },
  { id: "p2", title: "Mobile App", icon: "📱" },
  { id: "p3", title: "Q1 Planning", icon: "📊" },
];

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

interface ThreadRowProps {
  thread: ChatThread;
  isActive: boolean;
  project?: ChatProject;
}

function ThreadRow({ thread, isActive, project }: ThreadRowProps) {
  return (
    <Link
      href={`/app/chat/${thread.id}`}
      className={cn(
        "group block rounded-none border p-3 transition-all duration-200",
        isActive
          ? "border-foreground/40 bg-accent"
          : "border-border hover:border-foreground/20 hover:bg-accent/50",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {thread.pinned && (
              <HugeiconsIcon
                icon={PinIcon}
                className="size-3 text-muted-foreground shrink-0"
                strokeWidth={2}
              />
            )}
            <span className="text-sm font-medium truncate">
              {thread.title || "Untitled chat"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
            {thread.snippet}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground tabular-nums">
              {formatTimeAgo(thread.updatedAt)}
            </span>
            {project && (
              <Badge
                variant="outline"
                className="rounded-none text-[10px] h-4 px-1"
              >
                {project.icon} {project.title}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

interface ChatShellProps {
  children: React.ReactNode;
}

export function ChatShell({ children }: ChatShellProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  const isNewChat = pathname === "/app/chat";
  const activeThreadId = isNewChat ? null : pathname.split("/").pop();

  // Filter threads by search
  const filteredThreads = mockThreads.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.snippet.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const pinnedThreads = filteredThreads.filter((t) => t.pinned);
  const recentThreads = filteredThreads.filter((t) => !t.pinned);

  const getProject = (thread: ChatThread) =>
    thread.projectId
      ? mockProjects.find((p) => p.id === thread.projectId)
      : undefined;

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden rounded-none border">
      {/* Left Rail */}
      <div className="w-[340px] shrink-0 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b space-y-3">
          <Link href="/app/chat">
            <Button
              className={cn(
                "w-full h-9 rounded-none",
                isNewChat && "bg-accent text-accent-foreground",
              )}
              variant={isNewChat ? "secondary" : "default"}
            >
              <HugeiconsIcon
                icon={PlusSignIcon}
                className="size-4 mr-2"
                strokeWidth={2}
              />
              New chat
            </Button>
          </Link>

          <InputGroup className="w-full">
            <InputGroupAddon>
              <HugeiconsIcon
                icon={SearchIcon}
                className="size-4"
                strokeWidth={2}
              />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search threads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-sm"
            />
            {searchQuery && (
              <InputGroupAddon>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setSearchQuery("")}
                  className="h-6 w-6"
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

        {/* Thread List */}
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-4">
            {filteredThreads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No threads found</p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="mt-2"
                >
                  Clear search
                </Button>
              </div>
            ) : (
              <>
                {/* Pinned Section */}
                {pinnedThreads.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-1">
                      <HugeiconsIcon
                        icon={PinIcon}
                        className="size-3 text-muted-foreground"
                        strokeWidth={2}
                      />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Pinned
                      </span>
                      <Badge
                        variant="secondary"
                        className="rounded-none text-[10px] h-4 px-1"
                      >
                        {pinnedThreads.length}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {pinnedThreads.map((thread) => (
                        <ThreadRow
                          key={thread.id}
                          thread={thread}
                          isActive={thread.id === activeThreadId}
                          project={getProject(thread)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Section */}
                {recentThreads.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Recent
                      </span>
                      <Badge
                        variant="secondary"
                        className="rounded-none text-[10px] h-4 px-1"
                      >
                        {recentThreads.length}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {recentThreads.map((thread) => (
                        <ThreadRow
                          key={thread.id}
                          thread={thread}
                          isActive={thread.id === activeThreadId}
                          project={getProject(thread)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Panel */}
      <div className="flex-1 min-w-0 flex flex-col bg-background">
        {children}
      </div>
    </div>
  );
}
