import { ChatInspector } from "@/components/app/inspector/chat-inspector";

export default function ChatThreadInspectorPage({
  params,
}: {
  params: { threadId: string };
}) {
  return <ChatInspector threadId={params.threadId} />;
}
