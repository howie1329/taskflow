"use client";
import { ArrowUpIcon, PlusIcon } from "lucide-react";
import React, { useState } from "react";
import useSendAIMessage from "@/hooks/ai/useSendAIMessage";
import { AIModelSelector } from "../AIModelSelector";
import SettingsPopover from "../SettingsPopover";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import useFetchModelSelector from "@/hooks/ai/useFetchModelSelector";

export const AIChatInputArea = ({ id, model }) => {
  const { data: modelSelector } = useFetchModelSelector();
  const [aiModel, setAiModel] = useState(model || "");
  const [modelName, setModelName] = useState(
    id ? modelSelector?.find((m) => m.id === model)?.name : ""
  );
  const sendAIMessage = useSendAIMessage();
  const [input, setInput] = useState("");
  const [isSmartContext, setIsSmartContext] = useState(false);
  const [contextWindow, setContextWindow] = useState(4);
  const buttonActive = input.trim() !== "" && aiModel !== "";

  const handleSend = () => {
    setInput("");
    sendAIMessage.mutate({
      newMessage: input,
      conversationId: id || null,
      model: aiModel,
      settings: {
        isSmartContext: isSmartContext,
        contextWindow: contextWindow,
      },
    });
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
            if (buttonActive && !sendAIMessage.isPending) {
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
          disabled={!buttonActive || sendAIMessage.isPending}
          onClick={handleSend}
        >
          {sendAIMessage.isPending ? <Spinner /> : <ArrowUpIcon />}
        </InputGroupButton>

        <InputGroupAddon align="block-start">
          <SettingsPopover
            isSmartContext={isSmartContext}
            setIsSmartContext={setIsSmartContext}
            contextWindow={contextWindow}
            setContextWindow={setContextWindow}
          />
          <AIModelSelector
            setValue={setAiModel}
            modelName={modelName}
            setModelName={setModelName}
          />
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
