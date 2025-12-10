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
import { Separator } from "@/components/ui/separator";

export const ChatHistoryPopup = () => {
  const { conversations } = useChatHistoryContext();
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
        sideOffset={20}
        className="w-[50vw] h-[20vh] overflow-y-auto rounded-none"
      >
        <p className="text-sm font-medium text-center">Chat History</p>
        <Separator />
        <div>
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
        </div>
      </PopoverContent>
    </Popover>
  );
};
