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
} from "lucide-react";
import React from "react";
import Link from "next/link";
import { SignedIn, UserButton, UserProfile } from "@clerk/nextjs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useFetchNotifications } from "@/hooks/notifications/useFetchNotifications";
import { Badge } from "@/components/ui/badge";
import { useDeleteNotification } from "@/hooks/notifications/useDeleteNotification";
import { Button } from "@/components/ui/button";
import { useMarkNotificationAsRead } from "@/hooks/notifications/useMarkNotificationAsRead";
import { useTheme } from "next-themes";
import useFetchConversations from "@/hooks/ai/useFetchConversations";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function AppSideBar() {
  const { theme, setTheme } = useTheme();
  const { data: notifications } = useFetchNotifications();
  const { mutate: deleteNotification } = useDeleteNotification();
  const { mutate: markNotificationAsRead } = useMarkNotificationAsRead();
  const { data: conversations } = useFetchConversations();

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
    },
    {
      label: "AI Chat",
      icon: <MessageCircleIcon />,
      href: "/mainview/aichat",
      items: conversations && conversations.length > 0 ? conversations : null,
    },
  ];
  return (
    <Sidebar variant="inset">
      <SidebarHeader className="flex flex-row items-center justify-evenly gap-0  overflow-hidden">
        <p className="text-lg font-medium">TaskFlow</p>
        <SignedIn>
          <UserButton afterSignedOutUrl="/" />
        </SignedIn>
        <Popover>
          <PopoverTrigger>
            {/* TODO: Take bell icon and badge and put into a div for better styling of the number of notifications */}
            <BellIcon className=" cursor-pointer" />
            {notifications && notifications.length > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-0 -right-0.5 text-xs rounded-full w-4 h-4 flex items-center justify-center"
              >
                {notifications.length}
              </Badge>
            )}
          </PopoverTrigger>
          <PopoverContent className="flex flex-col max-w-full gap-2 ">
            {notifications &&
              notifications.map((notification) => (
                <div
                  className="grid grid-cols-[10px_1fr] border rounded-md px-2 py-1 max-w-full"
                  key={notification.id}
                >
                  <div className=" rounded-full flex items-center justify-center ">
                    {!notification.isRead && (
                      <CircleIcon className="w-2 h-2 bg-red-500 rounded-full p-0.5 text-red-500 " />
                    )}
                  </div>
                  <div className="flex flex-col max-w-full truncate">
                    <p className="text-sm font-medium max-w-full truncate">
                      {notification.title} - {notification.content}
                    </p>
                    <div className="flex flex-row items-center justify-between">
                      <p className="text-xs text-gray-500 max-w-full truncate">
                        {notification.created_at
                          ? new Date(notification.created_at).toLocaleString()
                          : "N/A"}
                      </p>
                      <div className="flex flex-row items-center justify-center">
                        {notification && !notification.isRead && (
                          <Button
                            variant="outline"
                            className="w-4 h-4"
                            onClick={() =>
                              markNotificationAsRead(notification.id)
                            }
                          >
                            <BookOpenIcon className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          className="w-4 h-4"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <TrashIcon className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </PopoverContent>
        </Popover>
      </SidebarHeader>
      <SidebarContent>
        {SideBarItems.map((item) => (
          <Collapsible key={item.label}>
            <CollapsibleTrigger>
              <SidebarGroupLabel>
                {item.label}
                {item.items && item.items.length > 0 && (
                  <ChevronDownIcon className="w-4 h-4" />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              {item.items &&
                item.items.length > 0 &&
                item.items.map((item) => (
                  <SidebarMenuSubButton key={item.id} className="gap-2" asChild>
                    <Link href={`/mainview/aichat/${item.id}`}>
                      {item.icon}
                      <span>
                        {item.title.charAt(0).toUpperCase() +
                          item.title.slice(1)}
                      </span>
                    </Link>
                  </SidebarMenuSubButton>
                ))}
            </CollapsibleContent>
          </Collapsible>
        ))}

        <SidebarSeparator />

        <SidebarMenu>
          {SideBarItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton className="gap-2" asChild>
                <Link href={item.href}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
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
