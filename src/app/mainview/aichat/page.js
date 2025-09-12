"use client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import useSendAIMessage from "@/hooks/ai/useSendAIMessage";
import React, { useState } from "react";

export default function Page() {
  return (
    <div className="flex flex-col gap-2 items-center justify-center h-[25vh] w-[85%]">
      <h2>Welcome To TaskFlow Chat Agent</h2>
      <div className="flex flex-row gap-2 items-center justify-center border-2 shadow-xl rounded-2xl w-[85%] h-[12vh] text-sm p-4">
        <AIChatInputArea />
      </div>
    </div>
  );
}

const AIChatInputArea = () => {
  const [aiModel, setAiModel] = useState("gemini-2.5-flash");
  const sendAIMessage = useSendAIMessage();
  const [input, setInput] = useState("");
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
        className="w-full h-full rounded-md p-2 focus:outline-none focus:ring-0"
        type="text"
        placeholder="Ask me anything"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <Separator />
      <div className="flex flex-row gap-2 items-center justify-end ">
        <Select value={aiModel} onValueChange={setAiModel}>
          <SelectTrigger className="text-xs ">
            <SelectValue placeholder="AI Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
            <SelectItem value="gemini-2.0-flash-lite">
              Gemini 2.0 Flash Lite
            </SelectItem>
            <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
            <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="default"
          size="sm"
          disabled={!buttonActive}
          onClick={handleSend}
        >
          Send
        </Button>
      </div>
    </div>
  );
};
