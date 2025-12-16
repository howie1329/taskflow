"use client";
import { useChatContext } from "./ChatContextProvider";
import { Popover } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { SettingsIcon } from "lucide-react";
import { PopoverTrigger } from "@/components/ui/popover";
import { PopoverContent } from "@/components/ui/popover";

export const ChatContextPopup = () => {
  const {
    systemPromptTokens,
    recentChatsTokens,
    currentChatTokens,
    userInfoTokens,
    sessionInfoTokens,
  } = useChatContext();
  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="outline" size="icon">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div>
          <p>System Prompt Tokens: {systemPromptTokens}</p>
          <p>Recent Chats Tokens: {recentChatsTokens}</p>
          <p>Current Chat Tokens: {currentChatTokens}</p>
          <p>User Info Tokens: {userInfoTokens}</p>
          <p>Session Info Tokens: {sessionInfoTokens}</p>
        </div>
      </PopoverContent>
    </Popover>
  );
};
