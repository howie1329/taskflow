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

export const AIChatInputArea = () => {
  const [aiModel, setAiModel] = useState("deepseek/deepseek-chat-v3.1:free");
  const sendAIMessage = useSendAIMessage();
  const [input, setInput] = useState("");
  const [isSmartContext, setIsSmartContext] = useState(false);
  const buttonActive = input.trim() !== "";

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
      <div className="flex flex-row gap-2 justify-between items-center ">
        <Popover>
          <PopoverTrigger>
            <Button variant="outline" size="sm">
              <SettingsIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="flex flex-row gap-2 items-center text-sm font-medium">
              <p>Smart Context</p>
              <Switch
                checked={isSmartContext}
                onCheckedChange={setIsSmartContext}
              />
            </div>
          </PopoverContent>
        </Popover>
        <NewModelSelector value={aiModel} setValue={setAiModel} />
        {/* <AIModelSelector value={aiModel} setValue={setAiModel} /> */}
        <Button
          variant="default"
          size="sm"
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

const NewModelSelector = ({ value, setValue }) => {
  const [open, setOpen] = useState(false);
  const models = [
    "openrouter/sonoma-dusk-alpha",
    "openrouter/sonoma-sky-alpha",
    "deepseek/deepseek-chat-v3.1:free",
    "google/gemini-2.5-flash-lite",
    "google/gemini-2.0-flash-001",
    "openai/gpt-4.1-nano",
    "openai/gpt-5",
    "openai/gpt-5-mini",
    "openai/gpt-4.1-mini",
    "openai/gpt-4o-mini",
    "google/gemini-2.5-flash",
    "anthropic/claude-3-haiku",
    "x-ai/grok-3-mini",
    "x-ai/grok-code-fast-1",
    "x-ai/grok-4-fast:free",
    "google/gemini-flash-1.5",
    "google/gemini-2.5-pro",
    "",
  ];
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="w-[100px]">
        <Button variant="ghost" onClick={() => setOpen(true)} size="sm">
          {value ? value : "Select Model"}
          <ChevronDownIcon className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[100px]">
        {models.map((model) => (
          <Button
            key={model}
            onClick={() => {
              setValue(model);
              setOpen(false);
            }}
            variant="ghost"
            size="sm"
          >
            <p>{model}</p>
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
};
