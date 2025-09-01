"use client";
import React from "react";
import { useParams } from "next/navigation";
import { mockChatData } from "../../../../../docs/testData/aiChatMockData";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

function Page() {
  const { id } = useParams();
  const chat = mockChatData.conversations.find((chat) => chat.id === id);

  if (!chat) {
    return <div>Chat not found</div>;
  }

  return (
    <div className="grid grid-rows-[1fr_13fr_2fr] border-black border-2 w-[50vw] h-full text-sm self-center items-center justify-center">
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
      <div className="flex justify-center">
        <Input placeholder="Add new message" />
      </div>
    </div>
  );
}

const RenderUserMessageContent = ({ userContent }) => {
  const timestamp = new Date(userContent.timestamp).toLocaleString();
  return (
    <div className="flex flex-col gap-1 items-end">
      <p>You</p>
      <div className="text-black bg-gray-300 p-2 rounded-md w-fit">
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
      <div className="text-black bg-gray-100 p-2 rounded-md w-fit">
        {assistantContent.content.aiResponse}
      </div>
      <p className="text-gray-500 text-xs">{timestamp}</p>
    </div>
  );
};
export default Page;
