"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { SignedIn, SignOutButton } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Moon02Icon,
  Sun02Icon,
  ColorsIcon,
  Notification02Icon,
  User02Icon,
  Settings02Icon,
  Logout02Icon,
  BookOpen02Icon,
  Delete01Icon,
  Menu01Icon,
  Search02Icon,
} from "@hugeicons/core-free-icons/index";
import { useFetchNotifications } from "@/hooks/notifications/useFetchNotifications";
import { useDeleteNotification } from "@/hooks/notifications/useDeleteNotification";
import { useMarkNotificationAsRead } from "@/hooks/notifications/useMarkNotificationAsRead";
import { useSidebar } from "@/components/ui/sidebar";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Input } from "@/components/ui/input";

export default function AppHeader({
  isGlobalSmartSearchOpen,
  setIsGlobalSmartSearchOpen,
}) {
  const { theme, setTheme } = useTheme();
  const { data: notifications } = useFetchNotifications();
  const { mutate: deleteNotification } = useDeleteNotification();
  const { mutate: markNotificationAsRead } = useMarkNotificationAsRead();
  const { toggleSidebar } = useSidebar();
  return (
    <header className=" w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        {/* Left side - Logo and Sidebar Toggle */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8"
          >
            <HugeiconsIcon icon={Menu01Icon} size={20} strokeWidth={2} />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-base font-semibold leading-none">TaskFlow</h1>
            <p className="text-xs text-muted-foreground leading-none">
              Productivity Suite
            </p>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="ml-auto flex items-center space-x-2">
          {/* Global Search */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsGlobalSmartSearchOpen(!isGlobalSmartSearchOpen)}
          >
            <KbdGroup>
              <Kbd>Cmd + K</Kbd>
            </KbdGroup>
            <HugeiconsIcon icon={Search02Icon} size={20} strokeWidth={2} />
          </Button>
          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {theme === "dark" ? (
                  <HugeiconsIcon icon={Moon02Icon} size={20} strokeWidth={2} />
                ) : (
                  <HugeiconsIcon icon={Sun02Icon} size={20} strokeWidth={2} />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Theme</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <HugeiconsIcon icon={Sun02Icon} size={20} strokeWidth={2} />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <HugeiconsIcon icon={Moon02Icon} size={20} strokeWidth={2} />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <HugeiconsIcon icon={ColorsIcon} size={20} strokeWidth={2} />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 relative"
              >
                <HugeiconsIcon
                  icon={Notification02Icon}
                  size={20}
                  strokeWidth={2}
                />
                {notifications && notifications.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 text-xs rounded-full w-5 h-5 flex items-center justify-center p-0 min-w-5"
                  >
                    {notifications.length > 9 ? "9+" : notifications.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-sm">Notifications</h3>
                <p className="text-xs text-muted-foreground">
                  {notifications?.length || 0} unread notifications
                </p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications && notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      className="flex items-start space-x-3 p-4 hover:bg-muted/50 transition-colors border-b last:border-b-0"
                      key={notification.id}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {!notification.isRead ? (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        ) : (
                          <div className="w-2 h-2 bg-muted-foreground/30 rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.content}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-muted-foreground">
                            {notification.created_at
                              ? new Date(
                                  notification.created_at
                                ).toLocaleString()
                              : "N/A"}
                          </p>
                          <div className="flex items-center space-x-1">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() =>
                                  markNotificationAsRead(notification.id)
                                }
                              >
                                <HugeiconsIcon
                                  icon={BookOpen02Icon}
                                  size={20}
                                  strokeWidth={2}
                                />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() =>
                                deleteNotification(notification.id)
                              }
                            >
                              <HugeiconsIcon
                                icon={Delete01Icon}
                                size={20}
                                strokeWidth={2}
                              />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <HugeiconsIcon
                      icon={Notification02Icon}
                      size={20}
                      strokeWidth={2}
                      className="text-muted-foreground mx-auto mb-2"
                    />
                    <p className="text-sm text-muted-foreground">
                      No notifications
                    </p>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* User Menu */}
          <SignedIn>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt="User" />
                    <AvatarFallback className="text-xs">
                      <HugeiconsIcon
                        icon={User02Icon}
                        size={20}
                        strokeWidth={2}
                      />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <HugeiconsIcon
                      icon={User02Icon}
                      size={20}
                      strokeWidth={2}
                    />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <HugeiconsIcon
                      icon={Settings02Icon}
                      size={20}
                      strokeWidth={2}
                    />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <SignOutButton>
                    <Button
                      variant="outline"
                      className="flex items-center justify-start h-8 w-full"
                    >
                      <HugeiconsIcon
                        icon={Logout02Icon}
                        size={20}
                        strokeWidth={2}
                      />
                      Sign Out
                    </Button>
                  </SignOutButton>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
