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
  SidebarMenuSubButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  MessageCircleIcon,
  NotebookIcon,
  SettingsIcon,
  CalendarIcon,
  ListIcon,
  FolderIcon,
  BellIcon,
  CheckIcon,
  CircleIcon,
  TrashIcon,
  BookOpenIcon,
  BookCheckIcon,
  MoonIcon,
  SunIcon,
  InboxIcon,
  ChevronDownIcon,
  MoreHorizontalIcon,
  PaletteIcon,
  LogOutIcon,
  UserIcon,
  SettingsIcon as SettingsIconLucide,
} from "lucide-react";
import React from "react";
import Link from "next/link";
import { SignedIn, UserButton, UserProfile } from "@clerk/nextjs";
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
import { Separator } from "@/components/ui/separator";
import useFetchConversations from "@/hooks/ai/useFetchConversations";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import useFetchNotes from "@/hooks/notes/useFetchNotes";

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
      icon: <InboxIcon />,
      href: "/mainview/inbox",
    },
    {
      label: "Schedule",
      icon: <CalendarIcon />,
      href: "/mainview/schedule",
    },
    {
      label: "Task",
      icon: <ListIcon />,
      href: "/mainview/task",
    },
    {
      label: "Projects",
      icon: <FolderIcon />,
      href: "/mainview/projects",
    },
    {
      label: "Notes",
      icon: <NotebookIcon />,
      href: "/mainview/notes",
      items: notes && notes.length > 0 ? notes : [],
    },
    {
      label: "AI Chat",
      icon: <MessageCircleIcon />,
      href: "/mainview/aichat",
      items: conversations && conversations.length > 0 ? conversations : [],
    },
  ];
  return (
    <Sidebar variant="inset">
      <SidebarHeader className="px-4 py-3 border-b border-sidebar-border">
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
                    <SunIcon className="h-4 w-4" />
                  ) : (
                    <MoonIcon className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Theme</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <SunIcon className="mr-2 h-4 w-4" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <MoonIcon className="mr-2 h-4 w-4" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <PaletteIcon className="mr-2 h-4 w-4" />
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
                  <BellIcon className="h-4 w-4" />
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
                                  <BookOpenIcon className="h-3 w-3" />
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
                                <TrashIcon className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <BellIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
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
                        <UserIcon className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <UserIcon className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <SettingsIconLucide className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    Sign Out
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
            <Collapsible key={item.label}>
              <div className="flex flex-row items-center justify-between">
                <SidebarGroupLabel>
                  <Link className="text-xs font-semibold" href={item.href}>
                    {item.label}
                  </Link>
                </SidebarGroupLabel>
                <CollapsibleTrigger>
                  {item.items && item.items.length > 0 && (
                    <ChevronDownIcon className="w-4 h-4" />
                  )}
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                {item.items &&
                  item.items.length > 0 &&
                  item.items.slice(0, 3).map((subItem) => (
                    <SidebarMenuSubButton
                      key={subItem.id}
                      className="gap-2 justify-start"
                      asChild
                    >
                      <Link href={`${item.href}/${subItem.id}`}>
                        {subItem.icon}
                        <span className="text-xs truncate">
                          {subItem.title.charAt(0).toUpperCase() +
                            subItem.title.slice(1)}
                        </span>
                      </Link>
                    </SidebarMenuSubButton>
                  ))}
                {item.items && item.items.length > 3 && (
                  <SidebarMenuSubButton
                    className="gap-2 text-xs justify-start"
                    asChild
                  >
                    <Link href={item.href}>
                      <p className="text-xs">More</p>
                    </Link>
                  </SidebarMenuSubButton>
                )}
              </CollapsibleContent>
            </Collapsible>
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
                    <MoonIcon className="w-4 h-4" />
                  ) : (
                    <SunIcon className="w-4 h-4" />
                  )}
                </Button>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Popover>
                  <PopoverTrigger>
                    <div className="flex flex-row items-center gap-2 text-sm font-normal">
                      <SettingsIcon className="w-4 h-4" />
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
