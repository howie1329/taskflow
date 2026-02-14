import { ChatInspector } from "@/components/app/inspector/chat-inspector";

export default async function ChatThreadInspectorPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  return <ChatInspector threadId={threadId} />;
}
