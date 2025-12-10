"use client";
import {
  RenderAssistantMessageContent,
  RenderToolMessageContent,
  RenderUserMessageContent,
} from "@/app/mainview/aichat/[id]/page";
import { useChatHistoryContext } from "./ChatHistoryProvider";
import { useChatMessageContext } from "./ChatMessageProvider";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";

export const ChatMessagesClient = () => {
  const { messages, messagesLoading } = useChatMessageContext();
  const { conversations, conversationsLoading } = useChatHistoryContext();

  if (messagesLoading || conversationsLoading) {
    return (
      <Empty>
        <EmptyHeader>
          <Spinner />
        </EmptyHeader>
        <EmptyTitle> Loading Messages...</EmptyTitle>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {messages &&
        messages.map((message) => (
          <div key={message.id}>
            {message.parts.map((part) => {
              switch (part.type) {
                case "data-get-tasks":
                  return <p key={part.id}>{part.data.message}</p>;
                case "tool-WebSearchAgent":
                  return (
                    <RenderToolMessageContent
                      toolStatus={part.state}
                      key={part.toolCallId}
                      toolName={"Web Search Tool"}
                    />
                  );
                case "tool-TaskAgent":
                  return (
                    <RenderToolMessageContent
                      toolStatus={part.state}
                      key={part.toolCallId}
                      toolName={"TaskAgent"}
                    />
                  );
                case "tool-NoteAgent":
                  return (
                    <RenderToolMessageContent
                      toolStatus={part.state}
                      key={part.id}
                      toolName={"NoteAgent"}
                    />
                  );
                case "text":
                  if (message.role === "user") {
                    return (
                      <RenderUserMessageContent
                        messageContent={message}
                        partContent={part}
                        key={part.id}
                      />
                    );
                  } else {
                    return (
                      <RenderAssistantMessageContent
                        messageContent={message}
                        partContent={part}
                        key={part.id}
                      />
                    );
                  }
                default:
                  return null;
              }
            })}
          </div>
        ))}
    </div>
  );
};
