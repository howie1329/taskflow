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
} from "lucide-react";
import React from "react";
import Link from "next/link";
import { SignedIn, UserButton } from "@clerk/nextjs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const SideBarItems = [
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
  },
];

export default function AppSideBar() {
  return (
    <Sidebar variant="inset">
      <SidebarHeader className="flex flex-row items-center justify-evenly gap-1 ">
        <p className="text-lg font-medium">TaskFlow</p>
        <SignedIn>
          <UserButton afterSignedOutUrl="/" />
        </SignedIn>
        <Popover>
          <PopoverTrigger>
            <BellIcon className="w-5 h-5 cursor-pointer" />
          </PopoverTrigger>
          <PopoverContent>
            <p>Hello World</p>
          </PopoverContent>
        </Popover>
      </SidebarHeader>
      <SidebarContent>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>TaskFlow</SidebarGroupLabel>
          <SidebarMenu>
            {SideBarItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton asChild>
                  <Link href={item.href}>
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a>
                  <SettingsIcon />
                  <span>Settings</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
