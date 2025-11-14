"use client";
import { AIChatInputArea } from "@/presentation/components/aiChat/page/AiChatInputArea";
import React, { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axiosClient from "@/lib/axios/axiosClient";
import { useQueryClient } from "@tanstack/react-query";
import useInitalChatStore from "@/hooks/ai/store/initalChatStore";

export default function Page() {
  const [conversationId, setConversationId] = useState(crypto.randomUUID());
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const router = useRouter();
  const { setMessages, toogleFirstMessage } = useInitalChatStore();

  const handleSendMessage = async (
    message,
    model,
    isSmartContext,
    contextWindow
  ) => {
    const token = await getToken();
    const response = await axiosClient.post(
      "/api/v1/conversations/create",
      {
        message: message,
        id: conversationId,
      },
      {
        headers: {
          Authorization: token,
        },
        withCredentials: true,
      }
    );
    console.log("RESPONSE", response.data.data.id);
    let newConversationId = response.data.data.id;
    setConversationId(response.data.data.id);
    toogleFirstMessage();
    setMessages(
      message,
      newConversationId,
      model,
      isSmartContext,
      contextWindow
    );
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
    router.push(`/mainview/aichat/${newConversationId}`);
  };
  return (
    <div className="flex flex-col gap-2 items-center justify-center h-[25vh] w-[85%]">
      <h2>Welcome To TaskFlow Chat Agent</h2>

      <AIChatInputArea
        id={conversationId}
        handleSendMessage={handleSendMessage}
        status={""}
      />
    </div>
  );
}
