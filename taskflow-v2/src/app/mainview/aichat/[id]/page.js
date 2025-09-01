"use client";
import React from "react";
import { useParams } from "next/navigation";
import { mockChatData } from "../../../../../docs/testData/aiChatMockData";

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
      <h1>{chat.title}</h1>
      <div>
        {chat.messages.map((message) => (
          <div key={message.id}>
            <strong>{message.role}:</strong>
            {renderMessageContent(message.content)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Page;
