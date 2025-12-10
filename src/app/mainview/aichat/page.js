import { ChatModelProvider } from "@/presentation/components/aiChat/providers/ChatModelProvider";
import { ChatHistoryProvider } from "@/presentation/components/aiChat/providers/ChatHistoryProvider";
import { ChatMessageProvider } from "@/presentation/components/aiChat/providers/ChatMessageProvider";
import { ChatPageClient } from "@/presentation/components/aiChat/providers/ChatPageClient";
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
