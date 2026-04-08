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
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export const ChatHistoryPopup = () => {
  const { conversations } = useChatHistoryContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredConversations, setFilteredConversations] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const filteredConversations = conversations.filter((conversation) =>
        conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConversations(filteredConversations);
    }, 350); // 350ms debounce time
    return () => clearTimeout(timer);
  }, [searchQuery, conversations]);

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
        className="flex flex-col w-screen lg:w-[60vw] h-[35vh] overflow-y-hidden rounded-none gap-2 "
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
          <AnimatePresence>
            {filteredConversations &&
              filteredConversations.map((conversation) => (
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  key={conversation.id}
                  className="flex flex-row items-center justify-between border px-2"
                >
                  <Link
                    className="w-full"
                    href={`/mainview/aichat/${conversation.id}`}
                  >
                    <div className="flex flex-col lg:flex-row lg:justify-between ">
                      <p className="text-sm text-ellipsis ">
                        {conversation.title}
                      </p>
                      <p className="text-xs text-muted-foreground text-right ">
                        {new Date(conversation.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </PopoverContent>
    </Popover>
  );
};
