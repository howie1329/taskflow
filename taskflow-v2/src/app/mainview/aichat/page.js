import { Button } from "@/components/ui/button";
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

const AIChatInputArea = () => {
  return (
    <div className="flex flex-col w-full h-full">
      <input
        className="w-full h-full rounded-md p-2 focus:outline-none focus:ring-0"
        type="text"
        placeholder="Ask me anything"
      />
      <Button className="self-end" variant="default">
        Send
      </Button>
    </div>
  );
};
