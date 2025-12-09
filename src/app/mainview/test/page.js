"use client";
import { Spinner } from "@/components/ui/spinner";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChatMessageProvider } from "@/presentation/components/aiChat/providers/ChatMessageProvider";

export default function Page() {
  const router = useRouter();

  return (
    <ChatMessageProvider conversationId={null}>
      <div>
        <h1>Chat Messages</h1>
      </div>
    </ChatMessageProvider>
  );
}
