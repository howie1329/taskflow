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

import React, { Suspense, useState } from "react";
import Link from "next/link";
import useFetchConversations from "@/hooks/ai/useFetchConversations";
import { MessageCircleIcon, PlusIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AISidebar() {
  const { data: conversations } = useFetchConversations();
  const [search, setSearch] = useState("");
  return (
    <div className="bg-white rounded-tl-xl rounded-bl-xl border h-full">
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link
                  className="flex justify-center text-xs bg-black text-white"
                  href={`/mainview/aichat`}
                >
                  New Chat
                  <PlusIcon className="w-4 h-4" />
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Input
                className="w-full h-6"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarMenu>
            {conversations
              ?.filter((item) =>
                item.title.toLowerCase().includes(search.toLowerCase())
              )
              .map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton asChild>
                    <Link href={`/mainview/aichat/${item.id}`}>
                      <MessageCircleIcon />
                      <span className="line-clamp-1 text-ellipsis text-xs">
                        {item.title.charAt(0).toUpperCase() +
                          item.title.slice(1)}
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
