"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CommandShortcut,
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { api } from "@/convex/_generated/api"
import type { NavIcon, WorkspaceNavCommandItem } from "@/lib/workspace-nav"
import { SHORTCUT_HINT, SHORTCUT_KEYS } from "@/lib/keyboard-shortcuts"
import { shouldIgnoreGlobalShortcut } from "@/lib/should-ignore-global-shortcut"

export type { WorkspaceNavCommandItem } from "@/lib/workspace-nav"

const RECENT_HREFS_STORAGE_KEY = "taskflow.command.recentHrefs"
const MAX_RECENTS = 6
const MAX_ENTITY_RESULTS = 8

export type WorkspaceCommandAction = {
  id: string
  title: string
  group: "Create" | "Actions"
  icon: NavIcon
  shortcut?: string
  keywords?: string[]
  onSelect: () => void
}

type WorkspaceNavCommandProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: WorkspaceNavCommandItem[]
  actions: WorkspaceCommandAction[]
}

export function WorkspaceNavCommand({
  open,
  onOpenChange,
  items,
  actions,
}: WorkspaceNavCommandProps) {
  const router = useRouter()
  const [recentHrefs, setRecentHrefs] = useState<string[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const raw = window.localStorage.getItem(RECENT_HREFS_STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      return parsed.filter((value) => typeof value === "string")
    } catch {
      return []
    }
  })
  const rawProjects = useQuery(api.projects.listMyProjects, { status: "active" })
  const rawNotes = useQuery(api.notes.listMyNotes, {})
  const rawThreads = useQuery(api.chat.listThreads, {})
  const projects = useMemo(() => rawProjects ?? [], [rawProjects])
  const notes = useMemo(() => rawNotes ?? [], [rawNotes])
  const threads = useMemo(() => rawThreads ?? [], [rawThreads])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return
      if (e.key.toLowerCase() !== SHORTCUT_KEYS.goTo) return
      if (shouldIgnoreGlobalShortcut(e.target)) return
      e.preventDefault()
      onOpenChange(true)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onOpenChange])

  const rememberHref = useCallback((href: string) => {
    setRecentHrefs((prev) => {
      const next = [href, ...prev.filter((value) => value !== href)].slice(
        0,
        MAX_RECENTS,
      )
      if (typeof window !== "undefined") {
        window.localStorage.setItem(RECENT_HREFS_STORAGE_KEY, JSON.stringify(next))
      }
      return next
    })
  }, [])

  const run = useCallback(
    (href: string) => {
      onOpenChange(false)
      rememberHref(href)
      router.push(href)
    },
    [onOpenChange, rememberHref, router],
  )

  const runAction = useCallback(
    (action: WorkspaceCommandAction) => {
      onOpenChange(false)
      action.onSelect()
    },
    [onOpenChange],
  )

  const pageGroupOrder = [...new Set(items.map((item) => item.group))]

  const entityItems = useMemo(() => {
    const recentNotes = [...notes]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, MAX_ENTITY_RESULTS)
      .map((note) => ({
        id: `note-${note._id}`,
        label: note.title.trim() || "Untitled note",
        href: `/app/notes/${note._id}`,
        value: `${note.title} note memo draft`,
        type: "Notes" as const,
      }))

    const activeProjects = projects.slice(0, MAX_ENTITY_RESULTS).map((project) => ({
      id: `project-${project._id}`,
      label: project.title.trim(),
      href: `/app/projects/${project._id}`,
      value: `${project.title} project workspace`,
      type: "Projects" as const,
    }))

    const recentThreads = threads
      .slice(0, MAX_ENTITY_RESULTS)
      .map((thread) => ({
        id: `thread-${thread.threadId}`,
        label: thread.title.trim() || "Untitled chat",
        href: `/app/chat/${thread.threadId}`,
        value: `${thread.title} chat thread conversation`,
        type: "Conversations" as const,
      }))

    return {
      projects: activeProjects,
      notes: recentNotes,
      threads: recentThreads,
    }
  }, [notes, projects, threads])

  const hrefItems = useMemo(() => {
    const pageEntries = items.map((item) => ({
      key: `page-${item.href}`,
      href: item.href,
      title: item.title,
      icon: item.icon,
      group: "Pages",
      value: `${item.title} ${item.group} ${item.href}`,
    }))
    const entityEntries = [
      ...entityItems.projects.map((item) => ({
        key: item.id,
        href: item.href,
        title: item.label,
        icon: null,
        group: item.type,
        value: item.value,
      })),
      ...entityItems.notes.map((item) => ({
        key: item.id,
        href: item.href,
        title: item.label,
        icon: null,
        group: item.type,
        value: item.value,
      })),
      ...entityItems.threads.map((item) => ({
        key: item.id,
        href: item.href,
        title: item.label,
        icon: null,
        group: item.type,
        value: item.value,
      })),
    ]
    return [...pageEntries, ...entityEntries]
  }, [entityItems, items])

  const recentItems = useMemo(
    () =>
      recentHrefs
        .map((href) => hrefItems.find((item) => item.href === href))
        .filter((item): item is (typeof hrefItems)[number] => Boolean(item)),
    [hrefItems, recentHrefs],
  )

  const groupedActions = useMemo(() => {
    const groups: Record<WorkspaceCommandAction["group"], WorkspaceCommandAction[]> = {
      Create: [],
      Actions: [],
    }
    for (const action of actions) {
      groups[action.group].push(action)
    }
    return groups
  }, [actions])

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command"
      description={`Pages, actions, and entities · ${SHORTCUT_HINT.routeHop}`}
      showCloseButton={false}
      className="sm:max-w-lg"
    >
      <Command className="rounded-lg">
        <CommandInput placeholder="Search commands, pages, and content…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {recentItems.length > 0 ? (
            <CommandGroup heading="Recent">
              {recentItems.map((item) => (
                <CommandItem
                  key={item.key}
                  value={`${item.title} ${item.group} recent ${item.value}`}
                  onSelect={() => run(item.href)}
                >
                  {item.icon ? (
                    <HugeiconsIcon icon={item.icon} className="size-3 shrink-0" />
                  ) : null}
                  <span className="truncate">{item.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}

          {groupedActions.Create.length > 0 ? (
            <CommandGroup heading="Create">
              {groupedActions.Create.map((action) => (
                <CommandItem
                  key={action.id}
                  value={`${action.title} ${action.group} ${action.keywords?.join(" ") ?? ""}`}
                  onSelect={() => runAction(action)}
                >
                  <HugeiconsIcon icon={action.icon} className="size-3 shrink-0" />
                  <span>{action.title}</span>
                  {action.shortcut ? (
                    <CommandShortcut>{action.shortcut}</CommandShortcut>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}

          {groupedActions.Actions.length > 0 ? (
            <CommandGroup heading="Actions">
              {groupedActions.Actions.map((action) => (
                <CommandItem
                  key={action.id}
                  value={`${action.title} ${action.group} ${action.keywords?.join(" ") ?? ""}`}
                  onSelect={() => runAction(action)}
                >
                  <HugeiconsIcon icon={action.icon} className="size-3 shrink-0" />
                  <span>{action.title}</span>
                  {action.shortcut ? (
                    <CommandShortcut>{action.shortcut}</CommandShortcut>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}

          {entityItems.projects.length > 0 ? (
            <CommandGroup heading="Projects">
              {entityItems.projects.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.value}
                  onSelect={() => run(item.href)}
                >
                  <span className="truncate">{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}

          {entityItems.notes.length > 0 ? (
            <CommandGroup heading="Notes">
              {entityItems.notes.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.value}
                  onSelect={() => run(item.href)}
                >
                  <span className="truncate">{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}

          {entityItems.threads.length > 0 ? (
            <CommandGroup heading="Conversations">
              {entityItems.threads.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.value}
                  onSelect={() => run(item.href)}
                >
                  <span className="truncate">{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}

          {pageGroupOrder.map((group) => (
            <CommandGroup key={group} heading={group}>
              {items
                .filter((i) => i.group === group)
                .map((item) => (
                  <CommandItem
                    key={item.href}
                    value={`${item.title} ${item.href}`}
                    onSelect={() => run(item.href)}
                  >
                    <HugeiconsIcon icon={item.icon} className="size-3 shrink-0" />
                    {item.title}
                  </CommandItem>
                ))}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
