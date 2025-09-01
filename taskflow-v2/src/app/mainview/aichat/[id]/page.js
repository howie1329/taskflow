"use client";
import React from "react";
import { useParams } from "next/navigation";
import { mockChatData } from "../../../../../docs/testData/aiChatMockData";
import { Separator } from "@/components/ui/separator";

function Page() {
  const { id } = useParams();
  const chat = mockChatData.conversations.find((chat) => chat.id === id);

  if (!chat) {
    return <div>Chat not found</div>;
  }

  const renderMessageContent = (content) => {
    const { tasks, notes, projects, events, aiResponse } = content;

    return (
      <div>
        {aiResponse && <p>{aiResponse}</p>}
        {tasks?.length > 0 && <div>Tasks: {tasks.length}</div>}
        {notes?.length > 0 && <div>Notes: {notes.length}</div>}
        {projects?.length > 0 && <div>Projects: {projects.length}</div>}
        {events?.length > 0 && <div>Events: {events.length}</div>}
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-xl font-medium text-center">{chat.title}</h1>
      <Separator />
      <div className="flex flex-col gap-2 scroll-y-auto h-full border-black border-2 ">
        {chat.messages.map((message) => (
          <div key={message.id}>
            {message.role === "user" ? (
              <RenderUserMessageContent userContent={message.content} />
            ) : (
              <RenderAssistantMessageContent
                assistantContent={message.content}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const RenderUserMessageContent = ({ userContent }) => {
  return (
    <div className="flex flex-col gap-1 items-end">
      <p>You</p>
      <div className="text-black bg-gray-300 p-2 rounded-md w-fit">
        {userContent.aiResponse}
      </div>
    </div>
  );
};

const RenderAssistantMessageContent = ({ assistantContent }) => {
  return (
    <div className="flex flex-col gap-1 items-start">
      <p>Assistant</p>
      <div className="text-black bg-gray-100 p-2 rounded-md w-fit">
        {assistantContent.aiResponse}
      </div>
    </div>
  );
};
export default Page;
