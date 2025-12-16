import { ChatModelProvider } from "@/presentation/components/aiChat/providers/ChatModelProvider";
import { ChatHistoryProvider } from "@/presentation/components/aiChat/providers/ChatHistoryProvider";
import { ChatMessageProvider } from "@/presentation/components/aiChat/providers/ChatMessageProvider";
import { ChatPageClient } from "@/presentation/components/aiChat/providers/ChatPageClient";
import { ChatSuggestionProvider } from "@/presentation/components/aiChat/providers/ChatSuggestionProvider";
import { ChatContextProvider } from "@/presentation/components/aiChat/providers/ChatContextProvider";
export default function Page() {
  return (
    <ChatModelProvider defaultModel="OpenAI: GPT-5">
      <ChatHistoryProvider>
        <ChatMessageProvider conversationId={null}>
          <ChatSuggestionProvider>
            <ChatContextProvider>
              <ChatPageClient />
            </ChatContextProvider>
          </ChatSuggestionProvider>
        </ChatMessageProvider>
      </ChatHistoryProvider>
    </ChatModelProvider>
  );
}
