"use client";
import { ChatInput } from "./ChatInput";
import { useChatMessageContext } from "./ChatMessageProvider";
import { ChatMessagesClient } from "./ChatMessagesClient";
import { ChatHeaderClient } from "./ChatHeaderClient";

export const ChatPageClient = () => {
  const { messages } = useChatMessageContext();
  const hasMessages = messages && messages.length > 0;

  return (
    <div className="flex flex-col gap-2 h-full w-full ">
      <div className="flex flex-col gap-2 items-center justify-center h-full w-full p-2">
        {!hasMessages && <h1>Welcome To TaskFlow Chat Agent</h1>}{" "}
        {hasMessages && <ChatHeaderClient />}
        <div
          className={
            hasMessages ? "overflow-y-auto h-full w-full max-h-[95vh]" : ""
          }
        >
          <ChatMessagesClient />
        </div>
        <ChatInput />
      </div>
    </div>
  );
};
