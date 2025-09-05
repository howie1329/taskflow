"use client";
import { Button } from "@/components/ui/button";
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
  const sendAIMessage = useSendAIMessage();
  const [input, setInput] = useState("");
  const buttonActive = input.trim() !== "";

  const handleSend = () => {
    setInput("");
    sendAIMessage.mutate({ newMessage: input, conversationId: null });
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
      <Button
        className="self-end"
        variant="default"
        disabled={!buttonActive}
        onClick={handleSend}
      >
        Send
      </Button>
    </div>
  );
};
