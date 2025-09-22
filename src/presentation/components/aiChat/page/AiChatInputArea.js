"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowUpIcon,
  ChevronDownIcon,
  Loader2Icon,
  SettingsIcon,
} from "lucide-react";
import React, { useState } from "react";
import useSendAIMessage from "@/hooks/ai/useSendAIMessage";
import { AIModelSelector } from "../AIModelSelector";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import useFetchModelSelector from "@/hooks/ai/useFetchModelSelector";
import SettingsPopover from "../SettingsPopover";

export const AIChatInputArea = () => {
  const [aiModel, setAiModel] = useState("");
  const [modelName, setModelName] = useState("");
  const sendAIMessage = useSendAIMessage();
  const [input, setInput] = useState("");
  const [isSmartContext, setIsSmartContext] = useState(false);
  const buttonActive = input.trim() !== "" && aiModel !== "";

  const handleSend = () => {
    setInput("");
    sendAIMessage.mutate({
      newMessage: input,
      conversationId: null,
      model: aiModel,
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
