import { ChatMessageProvider } from "@/presentation/components/aiChat/providers/ChatMessageProvider";
import { ChatHistoryProvider } from "@/presentation/components/aiChat/providers/ChatHistoryProvider";
import { ChatPageClient } from "@/presentation/components/aiChat/providers/ChatPageClient";
import { ChatModelProvider } from "@/presentation/components/aiChat/providers/ChatModelProvider";
import { ChatSuggestionProvider } from "@/presentation/components/aiChat/providers/ChatSuggestionProvider";

// This page is used to test the chat suggestion provider.
export default function Page() {
  return (
    <ChatModelProvider defaultModel="OpenAI: GPT-5">
      <ChatHistoryProvider>
        <ChatMessageProvider conversationId={null}>
          {/* Was causing deployment issues --  Chat Suggestion Provider */}
          <ChatSuggestionProvider conversationId={null}>
            <ChatPageClient />
          </ChatSuggestionProvider>
        </ChatMessageProvider>
      </ChatHistoryProvider>
    </ChatModelProvider>
  );
}
