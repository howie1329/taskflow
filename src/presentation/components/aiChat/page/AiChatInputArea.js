"use client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import useSendAIMessage from "@/hooks/ai/useSendAIMessage";
import { AIModelSelector } from "../AIModelSelector";

export const AIChatInputArea = () => {
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
        <AIModelSelector value={aiModel} setValue={setAiModel} />
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
