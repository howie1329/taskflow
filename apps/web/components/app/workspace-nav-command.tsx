"use client"

import { useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import type { ComponentProps } from "react"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

export type WorkspaceNavCommandItem = {
  title: string
  href: string
  icon: ComponentProps<typeof HugeiconsIcon>["icon"]
  group: string
}

type WorkspaceNavCommandProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: WorkspaceNavCommandItem[]
}

export function WorkspaceNavCommand({
  open,
  onOpenChange,
  items,
}: WorkspaceNavCommandProps) {
  const router = useRouter()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "k") return
      const t = e.target as HTMLElement | null
      if (!t) return
      if (t.closest("input, textarea, select, [contenteditable=true]"))
        return
      e.preventDefault()
      onOpenChange(true)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onOpenChange])

  const run = useCallback(
    (href: string) => {
      onOpenChange(false)
      router.push(href)
    },
    [onOpenChange, router],
  )

  const groupOrder = [...new Set(items.map((i) => i.group))]

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Go to"
      description="Search workspace pages"
      showCloseButton={false}
    >
      <Command className="rounded-lg">
        <CommandInput placeholder="Go to page…" />
        <CommandList>
          <CommandEmpty>No pages found.</CommandEmpty>
          {groupOrder.map((group) => (
            <CommandGroup key={group} heading={group}>
              {items
                .filter((i) => i.group === group)
                .map((item) => (
                  <CommandItem
                    key={item.href}
                    value={`${item.title} ${item.href}`}
                    onSelect={() => run(item.href)}
                  >
                    <HugeiconsIcon icon={item.icon} className="size-4 shrink-0" />
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
