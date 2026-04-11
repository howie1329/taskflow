import type { ComponentProps } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Task01Icon,
  FolderManagementIcon,
  MessageQuestionIcon,
  NoteIcon,
  SettingsIcon,
  InboxDownloadIcon,
  NotificationIcon,
} from "@hugeicons/core-free-icons"

export type NavIcon = ComponentProps<typeof HugeiconsIcon>["icon"]

export type NavItemDef = {
  title: string
  href: string
  icon: NavIcon
}

export const navPrimary: NavItemDef[] = [
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
]

export const navWorkspace: NavItemDef[] = [
  {
    title: "Notifications",
    href: "/app/notifications",
    icon: NotificationIcon,
  },
  {
    title: "Projects",
    href: "/app/projects",
    icon: FolderManagementIcon,
  },
]

export const settingsNavItem: NavItemDef = {
  title: "Settings",
  href: "/app/settings",
  icon: SettingsIcon,
}

export const navTools: NavItemDef[] = [
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
]

export const allNavItems: NavItemDef[] = [
  ...navPrimary,
  ...navWorkspace,
  settingsNavItem,
  ...navTools,
]

/**
 * Ordered list for workspace route hop (⌘⌥→ / ⌘⌥←).
 * Single source of truth — change order here only.
 */
export const WORKSPACE_ROUTE_CYCLE_HREFS: readonly string[] = [
  "/app/inbox",
  "/app/tasks",
  "/app/notifications",
  "/app/projects",
  "/app/chat",
  "/app/notes",
  "/app/settings",
] as const

export type WorkspaceNavCommandItemGroup = "Primary" | "Workspace" | "Tools"

export type WorkspaceNavCommandItem = {
  title: string
  href: string
  icon: NavIcon
  group: WorkspaceNavCommandItemGroup
}

export function buildWorkspaceCommandItems(): WorkspaceNavCommandItem[] {
  return [
    ...navPrimary.map((item) => ({
      ...item,
      group: "Primary" as const,
    })),
    ...navWorkspace.map((item) => ({
      ...item,
      group: "Workspace" as const,
    })),
    { ...settingsNavItem, group: "Workspace" as const },
    ...navTools.map((item) => ({
      ...item,
      group: "Tools" as const,
    })),
  ]
}

export function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/app/projects/")) return "Projects"
  if (pathname.startsWith("/app/chat/")) return "AI Chat"
  if (pathname.startsWith("/app/notes/")) return "Notes"
  const item = allNavItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  )
  if (item) return item.title
  if (pathname === "/app") return "Overview"
  return "Taskflow"
}
