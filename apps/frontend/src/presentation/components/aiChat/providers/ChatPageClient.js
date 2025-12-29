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
import { useEffect, useRef } from "react";

export const ChatPageClient = () => {
  const { messages, toolArtifacts, isToolArtifactsOpen } =
    useChatMessageContext();
  const hasMessages = messages && messages.length > 0;
  const scrollContainerRef = useRef(null);
  const lastUserMessageIdRef = useRef(null);

  // Scroll to snap new user messages to the top
  useEffect(() => {
    if (!messages || messages.length === 0) return;

    // Find the last user message
    const userMessages = messages.filter((msg) => msg.role === "user");
    if (userMessages.length === 0) return;

    const lastUserMessage = userMessages[userMessages.length - 1];

    // Only scroll if this is a new user message
    if (lastUserMessageIdRef.current !== lastUserMessage.id) {
      lastUserMessageIdRef.current = lastUserMessage.id;

      // Wait for DOM to update, then scroll
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          // Find the last user message element in the DOM
          const messageElements = scrollContainerRef.current.querySelectorAll('[data-message-id]');
          const lastUserMessageElement = Array.from(messageElements).find(
            (el) => el.getAttribute('data-message-id') === lastUserMessage.id
          );

          if (lastUserMessageElement) {
            // Scroll so the user message is at the top with some padding
            const containerTop = scrollContainerRef.current.getBoundingClientRect().top;
            const elementTop = lastUserMessageElement.getBoundingClientRect().top;
            const scrollOffset = elementTop - containerTop - 16; // 16px padding

            scrollContainerRef.current.scrollBy({
              top: scrollOffset,
              behavior: "smooth",
            });
          }
        }
      });
    }
  }, [messages]);

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
                ref={scrollContainerRef}
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
