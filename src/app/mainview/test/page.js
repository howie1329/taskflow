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

  const handlingSecondMessage = async () => {
    const userMessage = { role: "user", content: message };

    const res = fetch("http://localhost:3001/test", {
      method: "POST",
      body: JSON.stringify({ messages: [userMessage] }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const reader = (await res).body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      console.log("Text: ", text);
      setResponse((prev) => prev + text);
    }
  };
  return (
    <div>
      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={handlingSecondMessage}>Send</button>
      </div>

      <div className="border-2 border-black">
        <p>Response: {response}</p>
      </div>
    </div>
  );
}
