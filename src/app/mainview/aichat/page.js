"use client";
import { AIChatInputArea } from "@/presentation/components/aiChat/page/AiChatInputArea";
import React, { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Spinner } from "@/components/ui/spinner";
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
  const { messages, setMessages, toogleFirstMessage } = useInitalChatStore();
  // const { sendMessage, status, messages } = useChat({
  //   id: conversationId,
  //   transport: new DefaultChatTransport({
  //     api: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/conversations/${conversationId}/messages`,
  //     headers: async () => {
  //       const token = await getToken();
  //       return {
  //         Authorization: token,
  //       };
  //     },
  //     body: {
  //       conversationId: conversationId,
  //     },
  //   }),
  //   onFinish: async () => {
  //     queryClient.invalidateQueries({ queryKey: ["conversations"] });
  //     router.push(`/mainview/aichat/${conversationId}`);
  //   },
  // });

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

    // setTimeout(() => {
    //   console.log("conversationId", conversationId);
    //   sendMessage({
    //     text: message,
    //     metadata: {
    //       conversationId: newConversationId,
    //       model: model,
    //       isSmartContext: isSmartContext,
    //       contextWindow: contextWindow,
    //     },
    //   });
    // }, 1000);
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
