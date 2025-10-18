"use client";
import { AIChatInputArea } from "@/presentation/components/aiChat/page/AiChatInputArea";
import React, { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axiosClient from "@/lib/axios/axiosClient";

export default function Page() {
  const [conversationId, setConversationId] = useState(crypto.randomUUID());
  const { getToken } = useAuth();
  const router = useRouter();
  const { sendMessage, status, messages } = useChat({
    id: conversationId,
    transport: new DefaultChatTransport({
      api: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/conversations/${conversationId}/messages`,
      headers: async () => {
        const token = await getToken();
        return {
          Authorization: token,
        };
      },
      body: {
        conversationId: conversationId,
      },
    }),
    onFinish: async () => {
      router.push(`/mainview/aichat/${conversationId}`);
    },
  });

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

    setTimeout(() => {
      console.log("conversationId", conversationId);
      sendMessage({
        text: message,
        metadata: {
          conversationId: newConversationId,
          model: model,
          isSmartContext: isSmartContext,
          contextWindow: contextWindow,
        },
      });
    }, 1000);
  };
  return (
    <div className="flex flex-col gap-2 items-center justify-center h-[25vh] w-[85%]">
      <h2>Welcome To TaskFlow Chat Agent</h2>
      {status === "streaming" ? <Spinner /> : null}
      {messages.map((message) => (
        <div key={message.id}>
          {message.role === "user" ? "User: " : "AI: "}
          {message.parts.map((part, index) =>
            part.type === "reasoning" ? (
              <span key={index}>Reasoning: {part.text}</span>
            ) : null
          )}
          {message.parts.map((part, index) =>
            part.type === "text" ? <span key={index}>{part.text}</span> : null
          )}
        </div>
      ))}
      <AIChatInputArea
        id={conversationId}
        handleSendMessage={handleSendMessage}
        status={status}
      />
    </div>
  );
}
