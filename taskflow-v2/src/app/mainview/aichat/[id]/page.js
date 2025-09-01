"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { mockChatData } from "../../../../../docs/testData/aiChatMockData";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendIcon } from "lucide-react";

function Page() {
  const { id } = useParams();
  const chat = mockChatData.conversations.find((chat) => chat.id === id);

  if (!chat) {
    return <div>Chat not found</div>;
  }

  return (
    <div className="grid grid-rows-[1fr_12fr_1fr] shadow-lg rounded-lg w-[85%] h-full text-sm px-2">
      <div className="">
        <h1 className="text-xl font-medium text-center">{chat.title}</h1>
        <Separator />
      </div>
      <div className="flex flex-col gap-2 scroll-y-auto h-full overflow-y-auto  ">
        {chat.messages.map((message) => (
          <div key={message.id}>
            {message.role === "user" ? (
              <RenderUserMessageContent userContent={message} />
            ) : (
              <RenderAssistantMessageContent assistantContent={message} />
            )}
          </div>
        ))}
      </div>
      <ChatInputArea />
    </div>
  );
}

const RenderUserMessageContent = ({ userContent }) => {
  const timestamp = new Date(userContent.timestamp).toLocaleString();
  return (
    <div className="flex flex-col gap-1 items-end">
      <p>You</p>
      <div className="text-black bg-gray-300 rounded-md w-fit p-2">
        {userContent.content.aiResponse}
      </div>
      <p className="text-gray-500 text-xs">{timestamp}</p>
    </div>
  );
};

const RenderAssistantMessageContent = ({ assistantContent }) => {
  const timestamp = new Date(assistantContent.timestamp).toLocaleString();
  return (
    <div className="flex flex-col gap-1 items-start">
      <p>Assistant</p>
      <div className="text-black bg-gray-100 rounded-md w-fit p-2">
        {assistantContent.content.aiResponse}
      </div>
      <p className="text-gray-500 text-xs">{timestamp}</p>
    </div>
  );
};

const ChatInputArea = () => {
  const [input, setInput] = useState("");
  const buttonActive = input.trim() !== "";
  return (
    <div className="flex h-9 w-full rounded-md border gap-2 items-center">
      <input
        className=" h-full w-full px-2 border-none outline-none focus:border-none focus:outline-none"
        placeholder="Add new message"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <Button
        className="h-6 w-6 rounded-full"
        variant="ghost"
        disabled={!buttonActive}
      >
        <SendIcon />
      </Button>
    </div>
  );
};
export default Page;
