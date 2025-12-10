"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useChatHistoryContext } from "./ChatHistoryProvider";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { TransactionHistoryIcon } from "@hugeicons/core-free-icons/index";
import Link from "next/link";

export const ChatHistoryPopup = () => {
  const { conversations, conversationsLoading } = useChatHistoryContext();
  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="outline" size="sm">
          <HugeiconsIcon
            icon={TransactionHistoryIcon}
            size={20}
            strokeWidth={2}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-fit">
        {conversations &&
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              className="flex flex-row items-center justify-between"
            >
              <Link
                className="border rounded-md w-full"
                href={`/mainview/aichat/${conversation.id}`}
              >
                <p className="text-sm">{conversation.title}</p>
              </Link>
            </div>
          ))}
      </PopoverContent>
    </Popover>
  );
};
