import { AIChatInputArea } from "@/presentation/components/aiChat/page/AiChatInputArea";
import React from "react";

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
