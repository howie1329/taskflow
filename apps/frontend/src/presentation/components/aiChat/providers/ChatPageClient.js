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
import { motion } from "motion/react";

export const ChatPageClient = () => {
  const { messages, toolArtifacts, isToolArtifactsOpen } =
    useChatMessageContext();
  const hasMessages = messages && messages.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex flex-col gap-2 h-full w-full overflow-hidden"
    >
      <div className="grid grid-rows-[auto_1fr_auto] items-center justify-center h-full w-full p-2 overflow-hidden lg:flex lg:flex-col   ">
        {!hasMessages && <h1>Welcome To TaskFlow Chat Agent</h1>}
        {hasMessages && <ChatHeaderClient />}
        {hasMessages && (
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel>
              <div
                className={hasMessages ? "overflow-y-auto h-full w-full" : ""}
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
    </motion.div>
  );
};
