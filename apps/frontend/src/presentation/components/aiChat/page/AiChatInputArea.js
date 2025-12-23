"use client";
import { ArrowUpIcon, PlusIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { AIModelSelector } from "../AIModelSelector";
import SettingsPopover from "../SettingsPopover";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";

export const AIChatInputArea = ({ id, model, handleSendMessage, status }) => {
  const [aiModel, setAiModel] = useState(model || "");
  const [input, setInput] = useState("");
  const [isSmartContext, setIsSmartContext] = useState(false);
  const [contextWindow, setContextWindow] = useState(4);
  const buttonActive = input.trim() !== "" && aiModel !== "";

  const handleSend = () => {
    setInput("");
    handleSendMessage(input, aiModel, isSmartContext, contextWindow);
  };

  useEffect(() => {
    setAiModel(model);
  }, [model]);

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
