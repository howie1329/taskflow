"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { useState } from "react";
import { useChatMessageContext } from "./ChatMessageProvider";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Loading03Icon,
  Navigation03Icon,
} from "@hugeicons/core-free-icons/index";
import { AIModelSelector } from "../AIModelSelector";
import { useChatModelContext } from "./ChatModelProvider";
import { ChatHistoryPopup } from "./ChatHistoryPopup";

export const ChatInput = () => {
  const { sendMessage, status, defaultConversationId } =
    useChatMessageContext();
  const { selectedModelId } = useChatModelContext();
  const [userInput, setUserInput] = useState("");

  // Send Button Icon
  const SendButtonIcon = () => {
    if (status === "streaming") {
      return <HugeiconsIcon icon={Loading03Icon} size={20} strokeWidth={2} />;
    }
    return <HugeiconsIcon icon={Navigation03Icon} size={20} strokeWidth={2} />;
  };

  const handleSendMessage = (isSmartContext = false, contextWindow = 4) => {
    sendMessage({
      text: userInput,
      metadata: {
        conversationId: defaultConversationId,
        model: selectedModelId,
        isSmartContext: isSmartContext,
        contextWindow: contextWindow,
      },
    });
    setUserInput("");
  };

  return (
    <InputGroup className="w-[80vw]">
      <InputGroupTextarea
        placeholder="Ask, Search, or Chat With Your Agent..."
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (status !== "streaming") {
              handleSendMessage();
            }
          }
        }}
      />

      {/* Chat Input Addons -- Might Need to be a separate component */}
      <InputGroupAddon align="block-end" className="pb-0 pt-0">
        <InputGroupButton
          variant="outline"
          className="rounded-full"
          size="icon-xs"
          disabled={status === "streaming" || userInput.trim() === ""}
          onClick={() => {
            handleSendMessage();
          }}
        >
          <SendButtonIcon />
        </InputGroupButton>

        <InputGroupAddon align="block-start">
          <AIModelSelector />
          <ChatHistoryPopup />
        </InputGroupAddon>
      </InputGroupAddon>
    </InputGroup>
  );
};
