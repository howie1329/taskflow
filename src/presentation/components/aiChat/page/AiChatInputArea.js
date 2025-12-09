"use client";
import { ArrowUpIcon, PlusIcon } from "lucide-react";
import React, { useState } from "react";
import { AIModelSelector } from "../AIModelSelector";
import SettingsPopover from "../SettingsPopover";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { useChatSettingsContext } from "../providers/ChatSettingsProvider";

export const AIChatInputArea = ({ id, handleSendMessage, status }) => {
  // Get settings from context instead of managing locally
  const {
    model: aiModel,
    setModel: setAiModel,
    isSmartContext,
    setIsSmartContext,
    contextWindow,
    setContextWindow,
  } = useChatSettingsContext();

  const [input, setInput] = useState("");
  const buttonActive = input.trim() !== "" && aiModel !== "";

  const handleSend = () => {
    if (!buttonActive || status === "streaming") return;
    const messageToSend = input;
    setInput("");
    handleSendMessage(messageToSend, aiModel, isSmartContext, contextWindow);
  };

  return (
    <InputGroup className="bg-card">
      <InputGroupTextarea
        placeholder="Ask, Search, or Chat With Your Agent..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (buttonActive && status !== "streaming") {
              handleSend();
            }
          }
        }}
      />
      <InputGroupAddon align="block-end" className="pb-0 pt-0">
        <InputGroupButton
          variant="default"
          className="rounded-full"
          size="icon-xs"
          disabled={!buttonActive || status === "streaming"}
          onClick={handleSend}
        >
          {status === "streaming" ? <Spinner /> : <ArrowUpIcon />}
        </InputGroupButton>

        <InputGroupAddon align="block-start">
          <SettingsPopover
            isSmartContext={isSmartContext}
            setIsSmartContext={setIsSmartContext}
            contextWindow={contextWindow}
            setContextWindow={setContextWindow}
          />
          <AIModelSelector setValue={setAiModel} value={aiModel} />
          <InputGroupButton
            variant="outline"
            className="rounded-full"
            size="icon-xs"
          >
            <PlusIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroupAddon>
    </InputGroup>
  );
};
