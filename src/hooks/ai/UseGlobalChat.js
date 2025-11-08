import useChatStore from "./store/ChatStore";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

const useGlobalChat = () => {
  const { getToken } = useAuth();
  const {
    conversationId,
    messages,
    streamingStatus,
    setConversationId,
    setMessages,
    setStreamingStatus,
    reset,
  } = useChatStore();

  const {
    sendMessage,
    status,
    messages: chatMessages,
    setMessages: setChatMessages,
  } = useChat({
    id: conversationId,
    transport: new DefaultChatTransport({
      api: `${process.env.NEXT_PUBLIC_API_BASE_URL}/chat`,
      headers: async () => {
        const token = await getToken();
        return {
          Authorization: token,
        };
      },
      body: {
        conversationId: conversationId || 1,
      },
      withCredentials: true,
    }),
    messages: messages || [],
    onData: (data) => {
      console.log("Data", data);
    },
  });

  useEffect(() => {
    console.log("Global Store Messages", messages);
    if (chatMessages.length === 0 && messages.length > 0) {
      console.log("Setting Chat Messages", messages);
      setChatMessages(messages);
    }
  }, []); // Only run on mount

  // Sync useChat → Zustand (but don't clear Zustand if useChat is empty)
  useEffect(() => {
    if (chatMessages.length > 0) {
      setMessages(chatMessages);
    }
    setStreamingStatus(status);
  }, [chatMessages, status, setMessages, setStreamingStatus]);

  const handleSendMessage = (message, model, isSmartContext, contextWindow) => {
    sendMessage({
      text: message,
      metadata: {
        conversationId: conversationId,
        model: model,
        isSmartContext: isSmartContext,
        contextWindow: contextWindow,
      },
    });
  };

  return {
    messages,
    status,
    handleSendMessage,
    conversationId,
    streamingStatus,
    reset,
    setMessages,
  };
};

export default useGlobalChat;
