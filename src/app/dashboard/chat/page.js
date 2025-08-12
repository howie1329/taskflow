"use client";
import { toast } from "@/hooks/use-toast";
import { getSocket } from "@/lib/socket/socketClient";
import React, { useEffect, useState } from "react";

function Page() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const socket = getSocket();
  const handleSend = () => {
    if (input.trim() === "") {
      toast({
        title: "Please enter a message",
        variant: "destructive",
      });
      return;
    }
    const newUserMessage = { role: "user", content: input };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInput("");
    socket.emit("ai:taskflow:start", {
      userId: "user_2usb0Md2SjCvMehu1XHJBN2y03c",
      chatHistory: updatedMessages,
    });
  };
  const clearMessages = () => {
    setMessages([]);
  };

  useEffect(() => {
    const handleChunk = (data) => {
      console.log("Recived chunk", data);
      if (data.type == "text-delta") {
        setMessages([...messages, { role: "assistant", content: data.text }]);
      }
    };
    socket.on("ai:taskflow:stream", handleChunk);
  }, [socket, messages]);

  return (
    <div className="flex flex-col gap-4">
      <h1>Ai Chat</h1>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 border p-4 rounded-md">
          <h2 className="text-lg font-bold">Chat</h2>
          <div className="flex flex-col gap-2">
            <div>
              This is a chatbot that can answer questions and help you with your
              tasks.
            </div>
            {messages.map((message, index) => (
              <div key={index}>
                <p>{message.content}</p>
              </div>
            ))}
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Ask me anything"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button onClick={handleSend}>Send</button>
              <button onClick={clearMessages}>Clear</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
