import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import React from "react";
import useFetchConversations from "@/hooks/ai/useFetchConversations";
import useFetchNotes from "@/hooks/notes/useFetchNotes";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiChat02Icon,
  Calendar02Icon,
  CheckListIcon,
  ClipboardIcon,
  Folder02Icon,
  InboxIcon,
  Notebook02Icon,
} from "@hugeicons/core-free-icons/index";
import { MenuItem } from "./components/MenuItem";
export default function AppSideBar() {
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
      label: "Todo",
      icon: <HugeiconsIcon icon={ClipboardIcon} size={20} strokeWidth={2} />,
      href: "/mainview/todo",
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
    },
    {
      label: "AI Chat",
      icon: <HugeiconsIcon icon={AiChat02Icon} size={20} strokeWidth={2} />,
      href: "/mainview/aichat",
    },
  ];

  return (
    <Sidebar defaultOpen={false} className=" border-none" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          {SideBarItems.map((item) => (
            <MenuItem key={item.href} {...item} />
          ))}
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
