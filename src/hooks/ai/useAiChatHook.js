import { useAuth } from "@clerk/nextjs";
import useFetchConversation from "./useFetchConversation";
import useFetchConversationMessages from "./useFetchConversationMessages";
import { useState, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import axiosClient from "@/lib/axios/axiosClient";
import { useRouter } from "next/navigation";

const useAiChatHook = ({ conversationId }) => {
  const { getToken } = useAuth();
  const router = useRouter();
  const [localConversationId, setLocalConversationId] = useState(
    conversationId || null
  );

  const createConversation = async (message) => {
    const token = await getToken();
    const response = await axiosClient.post(
      "/api/v1/conversations/create",
      { message },
      {
        headers: { Authorization: token },
        withCredentials: true,
      }
    );

    const newId = response.data.data.id;
    setLocalConversationId(newId);
    router.push(`/mainview/aichat/${newId}`);
    return newId;
  };

  const { data: conversation } = useFetchConversation(localConversationId);
  const { data: chatMessages } =
    useFetchConversationMessages(localConversationId);

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/conversations/${localConversationId}/messages`,
      headers: async () => {
        const token = await getToken();
        return {
          Authorization: token,
        };
      },
      withCredentials: true,
    }),
  });

  useEffect(() => {
    console.log("Status", status);
    console.log("CHAT MESSAGES", messages);
  }, [messages, status]);

  const handleSendMessage = async (
    userMessage,
    selectedModel,
    isSmartContext,
    contextWindow
  ) => {
    let id = localConversationId;
    if (!id) {
      id = await createConversation(userMessage);
    }
    sendMessage({
      text: userMessage,
      metadata: {
        conversationId: id,
        model: selectedModel,
        isSmartContext: isSmartContext,
        contextWindow: contextWindow,
      },
    });
  };

  return {
    messages: [...messages],
    status,
    handleSendMessage,
    conversation,
  };
};

export default useAiChatHook;
