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
import { Badge } from "@/components/ui/badge";

export const ChatMessagesClient = () => {
  const { messages, messagesLoading, status, regenerate } =
    useChatMessageContext();
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
    <div className="flex flex-col gap-2 h-full w-full ">
      {messages &&
        messages.map((message) => {
          const parts = message.parts ?? [];

          const toolParts = parts.filter(
            (p) => typeof p?.type === "string" && p.type.startsWith("tool-")
          );

          const nonToolParts = parts.filter(
            (p) => !(typeof p?.type === "string" && p.type.startsWith("tool-"))
          );

          const getToolName = (type) => {
            switch (type) {
              case "tool-WebSearchAgent":
                return "Web Search Tool";
              case "tool-TaskAgent":
                return "TaskAgent";
              case "tool-NoteAgent":
                return "NoteAgent";
              default:
                return type?.replace("tool-", "") ?? "Tool";
            }
          };

          return (
            <div key={message.id} data-message-id={message.id}>
              {toolParts.length > 0 && (
                <div className="flex flex-row flex-wrap gap-2 mb-1">
                  {toolParts.map((part) => (
                    <RenderToolMessageContent
                      toolStatus={part.state}
                      key={part.toolCallId ?? part.id}
                      toolName={getToolName(part.type)}
                    />
                  ))}
                </div>
              )}

              {nonToolParts.map((part) => {
                switch (part.type) {
                  case "data-get-tasks":
                    return <p key={part.id}>{part.data.message}</p>;
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
          );
        })}

      {status === "streaming" && (
        <Badge variant="outline" className="flex flex-row gap-2 items-center">
          <Spinner />
          Thinking...
        </Badge>
      )}
    </div>
  );
};
