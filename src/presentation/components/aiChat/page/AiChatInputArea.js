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
          <Popover>
            <PopoverTrigger>
              <Button variant="outline" size="sm">
                <SettingsIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="max-w-fit">
              <div className="flex flex-row gap-2 items-center text-sm font-medium">
                <p className="text-xs">Smart Context</p>
                <Switch
                  checked={isSmartContext}
                  onCheckedChange={setIsSmartContext}
                />
              </div>
            </PopoverContent>
          </Popover>
          <NewModelSelector
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

const NewModelSelector = ({ setValue, modelName, setModelName }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: modelSelector } = useFetchModelSelector();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          variant="ghost"
          onClick={() => setOpen(true)}
          className=" max-w-fit p-0"
        >
          <p className="truncate text-sm p-0">
            {modelName ? modelName : "Select Model"}
          </p>
          <ChevronDownIcon className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-[250px] max-h-[250px] overflow-y-auto p-0">
        <div className="p-2">
          <input
            type="text"
            placeholder="Search Model..."
            className="w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {modelSelector &&
          modelSelector
            .filter((model) =>
              model.name.toLowerCase().includes(search.toLowerCase())
            )
            .map((model) => (
              <Button
                key={model.id}
                onClick={() => {
                  setValue(model.id);
                  setModelName(model.name);
                  setOpen(false);
                }}
                variant="ghost"
                size="sm"
              >
                <p className="truncate ">{model.name}</p>
              </Button>
            ))}
      </PopoverContent>
    </Popover>
  );
};
