"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import React, { useState } from "react";
import useSendAIMessage from "@/hooks/ai/useSendAIMessage";
import { AIModelSelector } from "../AIModelSelector";
import SettingsPopover from "../SettingsPopover";

export const AIChatInputArea = () => {
  const [aiModel, setAiModel] = useState("");
  const [modelName, setModelName] = useState("");
  const sendAIMessage = useSendAIMessage();
  const [input, setInput] = useState("");
  const [isSmartContext, setIsSmartContext] = useState(false);
  const [contextWindow, setContextWindow] = useState(4);
  const buttonActive = input.trim() !== "" && aiModel !== "";

  const handleSend = () => {
    setInput("");
    sendAIMessage.mutate({
      newMessage: input,
      conversationId: null,
      model: aiModel,
      settings: {
        isSmartContext: isSmartContext,
        contextWindow: contextWindow,
      },
    });
  };

  return (
    <div className="flex flex-col w-full h-full">
      <input
        className="w-full h-full rounded-md p-2 focus:outline-none focus:ring-0 "
        type="text"
        placeholder="Ask me anything"
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
      <Separator />
      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex flex-row gap-2 items-center justify-start">
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
        </div>
        <Button
          variant="default"
          size="sm"
          className="w-[42px] self-end justify-self-end"
          disabled={!buttonActive || sendAIMessage.isPending}
          onClick={handleSend}
        >
          {sendAIMessage.isPending ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowUpIcon className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};
