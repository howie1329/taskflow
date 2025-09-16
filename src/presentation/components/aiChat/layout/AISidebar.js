"use client";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

import React, { Suspense } from "react";
import Link from "next/link";
import useFetchConversations from "@/hooks/ai/useFetchConversations";
import { MessageCircleIcon, PlusIcon } from "lucide-react";

export default function AISidebar() {
  const { data: conversations } = useFetchConversations();
  return (
    <div className="bg-white rounded-xl border shadow-sm h-full">
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link
                  className="flex justify-center text-xs"
                  href={`/mainview/aichat`}
                >
                  New Chat
                  <PlusIcon className="w-4 h-4" />
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarMenu>
            {conversations?.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton asChild>
                  <Link href={`/mainview/aichat/${item.id}`}>
                    <MessageCircleIcon />
                    <span className="line-clamp-1 text-ellipsis text-xs">
                      {item.title.charAt(0).toUpperCase() + item.title.slice(1)}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </div>
  );
}
