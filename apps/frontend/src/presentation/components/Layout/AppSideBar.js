import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import React from "react";
import { SignedIn, SignOutButton, UserProfile } from "@clerk/nextjs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFetchNotifications } from "@/hooks/notifications/useFetchNotifications";
import { Badge } from "@/components/ui/badge";
import { useDeleteNotification } from "@/hooks/notifications/useDeleteNotification";
import { Button } from "@/components/ui/button";
import { useMarkNotificationAsRead } from "@/hooks/notifications/useMarkNotificationAsRead";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useFetchConversations from "@/hooks/ai/useFetchConversations";
import useFetchNotes from "@/hooks/notes/useFetchNotes";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiChat02Icon,
  BookOpen02Icon,
  Calendar02Icon,
  CheckListIcon,
  ColorsIcon,
  Folder02Icon,
  InboxIcon,
  Logout02Icon,
  Moon02Icon,
  Notebook02Icon,
  Notification02Icon,
  Settings02Icon,
  Sun02Icon,
  User02Icon,
  Delete01Icon,
  Settings05Icon,
} from "@hugeicons/core-free-icons/index";
import { MenuItem } from "./components/MenuItem";

export default function AppSideBar() {
  const { theme, setTheme } = useTheme();
  const { data: notifications } = useFetchNotifications();
  const { mutate: deleteNotification } = useDeleteNotification();
  const { mutate: markNotificationAsRead } = useMarkNotificationAsRead();
  const { data: conversations } = useFetchConversations();
  const { data: notes } = useFetchNotes();

  const SideBarItems = [
    {
      label: "Inbox",
      icon: <HugeiconsIcon icon={InboxIcon} size={20} strokeWidth={2} />,
      href: "/mainview/inbox",
    },
    {
      label: "Schedule",
      icon: <HugeiconsIcon icon={Calendar02Icon} size={20} strokeWidth={2} />,
      href: "/mainview/schedule",
    },
    {
      label: "Task",
      icon: <HugeiconsIcon icon={CheckListIcon} size={20} strokeWidth={2} />,
      href: "/mainview/task",
    },
    {
      label: "Projects",
      icon: <HugeiconsIcon icon={Folder02Icon} size={20} strokeWidth={2} />,
      href: "/mainview/projects",
    },
    {
      label: "Notes",
      icon: <HugeiconsIcon icon={Notebook02Icon} size={20} strokeWidth={2} />,
      href: "/mainview/notes",
      items: notes && notes.length > 0 ? notes : [],
    },
    {
      label: "AI Chat",
      icon: <HugeiconsIcon icon={AiChat02Icon} size={20} strokeWidth={2} />,
      href: "/mainview/aichat",
      items: conversations && conversations.length > 0 ? conversations : [],
    },
  ];
  return (
    <Sidebar className="[&_[data-sidebar=sidebar]]:!bg-background">
      <SidebarHeader className="px-3 py-2 border-b border-sidebar-border">
        <div className="flex flex-col items-center justify-between w-full gap-1.5">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-sidebar-foreground leading-none">
                TaskFlow
              </h1>
              <p className="text-xs text-sidebar-foreground/60 leading-none">
                Productivity Suite
              </p>
            </div>
          </div>

          {/* Bottom */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {theme === "dark" ? (
                    <HugeiconsIcon
                      icon={Moon02Icon}
                      size={20}
                      strokeWidth={2}
                    />
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
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {SideBarItems.map((item) => (
            <MenuItem key={item.href} {...item} />
          ))}
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Button
                  variant="outline"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? (
                    <HugeiconsIcon
                      icon={Moon02Icon}
                      size={20}
                      strokeWidth={2}
                    />
                  ) : (
                    <HugeiconsIcon icon={Sun02Icon} size={20} strokeWidth={2} />
                  )}
                </Button>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Popover>
                  <PopoverTrigger>
                    <div className="flex flex-row items-center gap-2 text-sm font-normal">
                      <HugeiconsIcon
                        icon={Settings05Icon}
                        size={20}
                        strokeWidth={2}
                      />
                      <span>Account</span>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent>
                    <UserProfile />
                  </PopoverContent>
                </Popover>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
