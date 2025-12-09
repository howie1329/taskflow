"use client";

import { useChatMessageContext } from "./ChatMessageProvider";
import { useChatHistoryContext } from "./ChatHistoryProvider";
import { useChatSettingsContext } from "./ChatSettingsProvider";
import { useModelContext } from "./ModelProvider";
import { AIChatInputArea } from "../page/AiChatInputArea";

export const ChatPageClient = () => {
  const { messages, sendMessage, status, messagesLoading } =
    useChatMessageContext();
  const { conversations, conversationsLoading } = useChatHistoryContext();
  const { model, isSmartContext, contextWindow } = useChatSettingsContext();
  const { models, modelsLoading } = useModelContext();

  const handleSendMessage = (message, selectedModel, smartContext, window) => {
    sendMessage({
      text: message,
      metadata: {
        model: selectedModel,
        isSmartContext: smartContext,
        contextWindow: window,
      },
    });
  };

  return (
    <div className="flex flex-col gap-2 border-black border-2 p-4">
      <h1>Chat Page Client (Test Page)</h1>
      
      <div className="flex flex-col gap-2">
        <h2 className="font-semibold">Settings:</h2>
        <p>Model: {model || "Not selected"}</p>
        <p>Smart Context: {isSmartContext ? "Enabled" : "Disabled"}</p>
        <p>Context Window: {contextWindow}</p>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="font-semibold">Messages ({messages?.length || 0}):</h2>
        {messagesLoading && <Spinner />}
        {messages?.map((msg) => (
          <div key={msg.id} className="border p-2 rounded">
            <p className="font-semibold">{msg.role}:</p>
            <p>{msg.parts?.find((p) => p.type === "text")?.text || "No text"}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="font-semibold">Conversations ({conversations?.length || 0}):</h2>
        {conversationsLoading && <Spinner />}
        {conversations?.map((conv) => (
          <div key={conv.id} className="border p-2 rounded">
            <p>{conv.id}</p>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <AIChatInputArea
          handleSendMessage={handleSendMessage}
          status={status}
        />
      </div>
    </div>
  );
};
