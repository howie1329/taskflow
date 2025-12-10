import { ChatMessageProvider } from "@/presentation/components/aiChat/providers/ChatMessageProvider";
import { ChatHistoryProvider } from "@/presentation/components/aiChat/providers/ChatHistoryProvider";
import { ChatPageClient } from "@/presentation/components/aiChat/providers/ChatPageClient";
import { ChatModelProvider } from "@/presentation/components/aiChat/providers/ChatModelProvider";

export default function Page() {
  return (
    <ChatModelProvider defaultModel="OpenAI: GPT-5">
      <ChatHistoryProvider>
        <ChatMessageProvider conversationId={null}>
          <ChatPageClient />
        </ChatMessageProvider>
      </ChatHistoryProvider>
    </ChatModelProvider>
  );
}
