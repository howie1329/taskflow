"use client";
import { Spinner } from "@/components/ui/spinner";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChatMessageProvider } from "@/presentation/components/aiChat/providers/ChatMessageProvider";
import {
  ChatHistoryProvider,
  useChatHistoryContext,
} from "@/presentation/components/aiChat/providers/ChatHistoryProvider";
import { ChatPageClient } from "@/presentation/components/aiChat/providers/ChatPageClient";

export default function Page() {
  const router = useRouter();

  return (
    <ChatHistoryProvider>
      <ChatMessageProvider conversationId={null}>
        <ChatPageClient />
      </ChatMessageProvider>
    </ChatHistoryProvider>
  );
}

const ChatHistory = () => {
  const { conversations, conversationsLoading } = useChatHistoryContext();
  return (
    <div className="flex flex-col gap-2">
      <h1>Chat History</h1>

      {conversations &&
        conversations.map((conversation) => (
          <div key={conversation.id}>
            <h2>{conversation.id}</h2>
          </div>
        ))}
    </div>
  );
};
