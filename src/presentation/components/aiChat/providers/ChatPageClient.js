"use client";
import { ChatInput } from "./ChatInput";
import { useChatMessageContext } from "./ChatMessageProvider";
import { ChatMessagesClient } from "./ChatMessagesClient";
import { ChatHeaderClient } from "./ChatHeaderClient";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ChatArtifactClient } from "./ChatArtifactClient";

export const ChatPageClient = () => {
  const { messages, toolArtifacts, isToolArtifactsOpen } =
    useChatMessageContext();
  const hasMessages = messages && messages.length > 0;

  return (
    <div className="flex flex-col gap-2 h-full w-full ">
      <div className="flex flex-col gap-2 items-center justify-center h-full w-full p-2">
        {!hasMessages && <h1>Welcome To TaskFlow Chat Agent</h1>}{" "}
        {hasMessages && <ChatHeaderClient />}
        {hasMessages && (
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel>
              <div
                className={
                  hasMessages
                    ? "overflow-y-auto h-full w-full max-h-[95vh]"
                    : ""
                }
              >
                <ChatMessagesClient />
              </div>
            </ResizablePanel>
            {toolArtifacts.length > 0 && isToolArtifactsOpen && (
              <>
                <ResizableHandle />
                <ResizablePanel>
                  <ChatArtifactClient />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        )}
        <ChatInput />
      </div>
    </div>
  );
};
