"use client";

import { useChatMessageContext } from "./ChatMessageProvider";
import { useChatHistoryContext } from "./ChatHistoryProvider";

export const ChatPageClient = () => {
  const { messages, messagesLoading } = useChatMessageContext();
  const { conversations, conversationsLoading } = useChatHistoryContext();
  return (
    <div className="flex flex-col gap-2 border-black border-2 ">
      <h1>Chat Page Client</h1>
    </div>
  );
};
