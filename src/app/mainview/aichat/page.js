import { AIChatInputArea } from "@/presentation/components/aiChat/page/AiChatInputArea";
import React from "react";

export default function Page() {
  return (
    <div className="flex flex-col gap-2 items-center justify-center h-[25vh] w-[85%]">
      <h2>Welcome To TaskFlow Chat Agent</h2>
      <AIChatInputArea />
    </div>
  );
}
