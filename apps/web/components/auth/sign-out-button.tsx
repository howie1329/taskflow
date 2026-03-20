"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Logout02Icon,
  Moon02Icon,
  SettingsIcon,
  Sun02Icon,
} from "@hugeicons/core-free-icons";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useState } from "react";
import { useTheme } from "next-themes";
import { useViewer } from "@/components/settings/hooks/use-viewer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SignOutButton() {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { displayValues, identityName, identityEmail } = useViewer();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const isDark = resolvedTheme === "dark";

  const fullName = [displayValues.firstName, displayValues.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  const fallbackName = identityName?.trim() || "";
  const displayName = fullName || fallbackName || "Taskflow User";
  const email = displayValues.email || identityEmail || "";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/");
    } catch {
      toast.error("Failed to sign out");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          tooltip="Account"
          className="h-10 min-h-10 gap-1.5 rounded-md border border-sidebar-border/60 bg-sidebar-accent/20 text-sidebar-foreground"
        >
          <Avatar size="sm" className="ring-0 after:hidden">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-[10px] font-semibold">
              {initials || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-medium">{displayName}</p>
            {email ? (
              <p className="truncate text-xs text-sidebar-foreground/65">
                {email}
              </p>
            ) : null}
          </div>
        </SidebarMenuButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="top"
        className="w-64 rounded-lg border border-border/70 p-1.5"
      >
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
