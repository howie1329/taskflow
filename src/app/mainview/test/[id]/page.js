"use client";

import { Spinner } from "@/components/ui/spinner";
import useChatStore from "@/hooks/ai/store/ChatStore";
import useGlobalChat from "@/hooks/ai/UseGlobalChat";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import useSocketConnection from "@/lib/sockets/useSocketConnection";

export default function Page() {
  const { id } = useParams();
  const { messages: globalMessages } = useChatStore();
  const { messages, status, handleSendMessage, setMessages } = useGlobalChat();
  const [title, setTitle] = useState("");
  const router = useRouter();
  const { socket, isConnected } = useSocketConnection();

  const [input, setInput] = useState("");

  useEffect(() => {
    if (socket && isConnected) {
      socket.on("connect", () => {
        console.log("Connected to socket");
      });

      socket.on("title-generated", (data) => {
        const { title } = data;
        setTitle(title);
      });
    }
  }, [socket, isConnected]);

  useEffect(() => {
    setMessages(globalMessages);
  }, [globalMessages, setMessages]);

  return (
    <>
      <Button variant="outline" onClick={() => router.push("/mainview/test")}>
        Back
      </Button>
      <h1>{title || "No title"}</h1>
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
            handleSendMessage(input, "gpt-4o-mini", false, 4);
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
