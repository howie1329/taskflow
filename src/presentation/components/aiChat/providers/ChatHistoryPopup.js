"use client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useChatHistoryContext } from "./ChatHistoryProvider";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  Search01Icon,
  TransactionHistoryIcon,
} from "@hugeicons/core-free-icons/index";
import Link from "next/link";
import { useState } from "react";

export const ChatHistoryPopup = () => {
  const { conversations } = useChatHistoryContext();
  const [searchQuery, setSearchQuery] = useState("");
  const filteredConversations = () => {
    if (!conversations) return [];

    return conversations.filter((conversation) =>
      conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="outline" size="icon">
          <HugeiconsIcon
            icon={TransactionHistoryIcon}
            size={20}
            strokeWidth={2}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        sideOffset={10}
        className="flex flex-col w-[80vw] h-[30vh] overflow-y-auto rounded-none gap-2 "
      >
        <div className="flex flex-row items-center justify-between border px-1">
          <HugeiconsIcon
            icon={Search01Icon}
            size={14}
            strokeWidth={2}
            className="text-muted-foreground"
          />
          <input
            className="w-full h-6 px-1 text-sm focus:outline-none focus:ring-0 border-none"
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery.length > 0 && (
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={14}
              strokeWidth={2}
              className="text-muted-foreground cursor-pointer"
              onClick={() => setSearchQuery("")}
            />
          )}
        </div>
        <div className="flex flex-col h-full gap-2 overflow-y-auto ">
          {filteredConversations() &&
            filteredConversations().map((conversation) => (
              <div
                key={conversation.id}
                className="flex flex-row items-center justify-between border px-2"
              >
                <Link
                  className="w-full"
                  href={`/mainview/aichat/${conversation.id}`}
                >
                  <div className="flex flex-row items-center">
                    <p className="flex-1 text-sm ">{conversation.title}</p>
                    <p className="text-xs text-muted-foreground text-right ">
                      {new Date(conversation.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
