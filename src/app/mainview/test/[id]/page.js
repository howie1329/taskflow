"use client";

import { Spinner } from "@/components/ui/spinner";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const { id } = useParams();
  const { messages, sendMessage, status } = useChat({
    id: id,
    transport: new DefaultChatTransport({
      api: "http://localhost:3001/chat",
      body: {
        conversationId: id,
      },
    }),
  });
  const [input, setInput] = useState("");

  return (
    <>
      {status === "streaming" ? <Spinner /> : null}
      {messages.map((message) => (
        <div key={message.id}>
          {message.role === "user" ? "User: " : "AI: "}
          {message.parts.map((part, index) =>
            part.type === "data-notification" ? (
              <span key={index}>{part.data.message}</span>
            ) : null
          )}
          {message.parts.map((part, index) =>
            part.type === "text" ? <span key={index}>{part.text}</span> : null
          )}
        </div>
      ))}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) {
            sendMessage({ text: input });
            setInput("");
          }
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={status !== "ready"}
          placeholder="Say something..."
        />
        <button type="submit" disabled={status !== "ready"}>
          Submit
        </button>
      </form>
    </>
  );
}
