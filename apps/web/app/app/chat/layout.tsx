"use client";

import { useParams } from "next/navigation";
import { ChatProvider } from "./components/chat-provider";
import { ChatPageTransition } from "@/components/ui/chat-page-transition";
import { useIsMobile } from "@/hooks/use-mobile";

function ChatLayoutContent({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const isMobile = useIsMobile();
  const isThreadRoute = params.threadId ? true : false;

  const transitionVariant = isThreadRoute && isMobile ? "slideInRight" : "fade";

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-background">
      <ChatPageTransition
        variant={transitionVariant}
        className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-background"
      >
        {children}
      </ChatPageTransition>
    </div>
  );
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatProvider>
      <ChatLayoutContent>{children}</ChatLayoutContent>
    </ChatProvider>
  );
}
