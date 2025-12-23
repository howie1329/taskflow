"use client";
import {
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import React, { useState } from "react";
import Link from "next/link";
import useFetchConversations from "@/hooks/ai/useFetchConversations";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  Message01Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons/index";

export default function AISidebar() {
  const { data: conversations } = useFetchConversations();
  const [search, setSearch] = useState("");
  return (
    <div className="bg-card rounded-tl-md rounded-bl-md border-r h-full">
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link
                  className="flex justify-center text-xs bg-primary text-accent"
                  href={`/mainview/aichat`}
                >
                  New Chat
                  <HugeiconsIcon
                    icon={PlusSignIcon}
                    size={20}
                    strokeWidth={2}
                  />
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <div className="flex flex-row items-center w-full h-6 border rounded-md p-2 text-xs font-medium">
                <input
                  type="text"
                  className="w-full h-6 outline-none"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search.length > 0 && (
                  <HugeiconsIcon
                    icon={Cancel01Icon}
                    size={20}
                    strokeWidth={2}
                    className="cursor-pointer"
                    onClick={() => setSearch("")}
                  />
                )}
              </div>
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
                    <Link
                      className="gap-2"
                      href={`/mainview/aichat/${item.id}`}
                    >
                      <HugeiconsIcon
                        icon={Message01Icon}
                        size={20}
                        strokeWidth={2}
                      />
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
