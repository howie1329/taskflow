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
import {
  HomeIcon,
  MessageCircleIcon,
  NotebookIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
import React from "react";

const SideBarItems = [
  {
    label: "Task",
    icon: <HomeIcon />,
  },
  {
    label: "Projects",
    icon: <UsersIcon />,
  },
  {
    label: "Notes",
    icon: <NotebookIcon />,
  },
  {
    label: "AI Chat",
    icon: <MessageCircleIcon />,
  },
];

export default function AppSideBar() {
  return (
    <Sidebar variant="inset">
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>TaskFlow</SidebarGroupLabel>
          <SidebarMenu>
            {SideBarItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton asChild>
                  <a>
                    {item.icon}
                    <span>{item.label}</span>
                  </a>
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
