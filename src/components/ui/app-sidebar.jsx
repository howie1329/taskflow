import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./sidebar";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import {
  FolderKanbanIcon,
  HomeIcon,
  ListChecksIcon,
  PresentationIcon,
  ScrollTextIcon,
  SettingsIcon,
  UserIcon,
  MessageCircleIcon,
} from "lucide-react";

export default function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* User Profile Section */}
        <div className="p-4 border-b">
          <SignedIn>
            <div className="flex items-center gap-3">
              <UserButton afterSignOutUrl="/" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Your Workspace</p>
              </div>
            </div>
          </SignedIn>
          <SignedOut>
            <div className="flex flex-col gap-2">
              <SignInButton mode="modal">
                <button className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="w-full px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </SignedOut>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Workspace Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workspaceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/settings" className="flex items-center gap-3">
                    <SettingsIcon className="w-5 h-5" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

const mainItems = [
  {
    title: "Home",
    icon: HomeIcon,
    url: "/",
  },
  {
    title: "Dashboard",
    icon: PresentationIcon,
    url: "/dashboard",
  },
];

const workspaceItems = [
  {
    title: "Tasks",
    icon: ListChecksIcon,
    url: "/dashboard/tasks",
  },
  {
    title: "Projects",
    icon: FolderKanbanIcon,
    url: "/dashboard/projects",
  },
  {
    title: "Notes",
    icon: ScrollTextIcon,
    url: "/dashboard/notes",
  },
  {
    title: "Chat",
    icon: MessageCircleIcon,
    url: "/dashboard/chat",
  },
];
