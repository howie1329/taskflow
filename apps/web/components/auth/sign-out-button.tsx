"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  Logout02Icon,
  Moon02Icon,
  SettingsIcon,
  Sun02Icon,
} from "@hugeicons/core-free-icons"
import { useAuthActions } from "@convex-dev/auth/react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { useState } from "react"
import { useTheme } from "next-themes"
import { useViewer } from "@/components/settings/hooks/use-viewer"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type AccountMenuTriggerVariant = "header" | "icon"

function useAccountProfile() {
  const { displayValues, identityName, identityEmail } = useViewer()

  const fullName = [displayValues.firstName, displayValues.lastName]
    .filter(Boolean)
    .join(" ")
    .trim()

  const fallbackName = identityName?.trim() || ""
  const displayName = fullName || fallbackName || "Taskflow User"
  const email = displayValues.email || identityEmail || ""
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

  return { displayName, email, initials }
}

function AccountMenuDropdownContent({
  displayName,
  email,
}: {
  displayName: string
  email: string
}) {
  const { signOut } = useAuthActions()
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const isDark = resolvedTheme === "dark"

  const handleSignOut = async () => {
    setIsSigningOut(true)

    try {
      await signOut()
      toast.success("Signed out successfully")
      router.push("/")
    } catch {
      toast.error("Failed to sign out")
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <>
      <DropdownMenuLabel className="px-2 py-1.5">
        <p className="truncate text-sm font-medium text-foreground">
          {displayName}
        </p>
        {email ? (
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        ) : null}
      </DropdownMenuLabel>
      <DropdownMenuSeparator />

      <DropdownMenuItem asChild>
        <Link href="/app/settings" className="cursor-pointer">
          <HugeiconsIcon icon={SettingsIcon} className="size-4" />
          <span>Settings</span>
        </Link>
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="cursor-pointer"
      >
        <HugeiconsIcon
          icon={isDark ? Sun02Icon : Moon02Icon}
          className="size-4"
        />
        <span>{isDark ? "Light mode" : "Dark mode"}</span>
      </DropdownMenuItem>

      <DropdownMenuSeparator />
      <DropdownMenuItem
        variant="destructive"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="cursor-pointer"
      >
        <HugeiconsIcon icon={Logout02Icon} className="size-4" />
        <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
      </DropdownMenuItem>
    </>
  )
}

export function AccountMenu({
  triggerVariant = "header",
  className,
}: {
  triggerVariant?: AccountMenuTriggerVariant
  className?: string
}) {
  const { displayName, email, initials } = useAccountProfile()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {triggerVariant === "icon" ? (
          <SidebarMenuButton
            size="sm"
            tooltip="Account"
            className={cn(
              "size-8 justify-center rounded-full p-0 text-sidebar-foreground hover:bg-sidebar-accent",
              className,
            )}
          >
            <Avatar size="sm" className="size-7 ring-0 after:hidden">
              <AvatarFallback className="bg-sidebar-accent text-[10px] font-semibold text-sidebar-accent-foreground">
                {initials || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="sr-only">Account</span>
          </SidebarMenuButton>
        ) : (
          <SidebarMenuButton
            size="sm"
            tooltip={displayName}
            className={cn(
              "h-9 min-h-9 w-full gap-2 rounded-lg px-2 text-sidebar-foreground hover:bg-sidebar-accent/80",
              className,
            )}
          >
            <Avatar size="sm" className="size-7 shrink-0 ring-0 after:hidden">
              <AvatarFallback className="bg-sidebar-accent text-[10px] font-semibold text-sidebar-accent-foreground">
                {initials || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1 truncate text-left text-xs font-medium">
              {displayName}
            </span>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              className="size-3 shrink-0 opacity-60"
              strokeWidth={2}
            />
          </SidebarMenuButton>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        side="bottom"
        className="w-64 rounded-lg border border-border/70 p-1.5"
      >
        <AccountMenuDropdownContent displayName={displayName} email={email} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
