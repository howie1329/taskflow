import { ChatInput } from "./ChatInput";
import { ChatMessagesClient } from "./ChatMessagesClient";

export const ChatPageClient = () => {
  return (
    <div className="flex flex-col gap-2 border-black border-2 h-full w-full ">
      <div className="border-red-500 border-2 flex flex-col gap-2 items-center justify-center h-full w-full">
        <h1>Welcome To TaskFlow Chat Agent</h1>
        <ChatMessagesClient />
        <ChatInput />
      </div>
    </div>
  );
};
