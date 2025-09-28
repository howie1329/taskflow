"use client";
import { useSockets } from "@/lib/sockets/useSockets";
import React, { useState } from "react";

export default function Page() {
  const { socket } = useSockets();
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const handleSendMessage = () => {
    socket.emit("ai-chat", { message, chatId: "test" });
    socket.on("ai-chat", (data) => {
      console.log("Ai Streaming Data: ", data);

      setResponse((prev) => prev + data);
    });
  };
  return (
    <div>
      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>

      <div className="border-2 border-black">
        <p>Response: {response}</p>
      </div>
    </div>
  );
}
