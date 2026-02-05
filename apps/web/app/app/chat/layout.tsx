import { ChatShell } from "./components/chat-shell"
import { ChatProvider } from "./components/chat-provider"

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ChatProvider>
      <ChatShell>{children}</ChatShell>
    </ChatProvider>
  )
}
