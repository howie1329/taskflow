"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { ChatProvider, useChatConfig } from "./components/chat-provider";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ChatPageTransition } from "@/components/ui/chat-page-transition";
import { useIsMobile } from "@/hooks/use-mobile";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  MessageQuestionIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

function ChatMobileHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const isMobile = useIsMobile();
  const { thread } = useChatConfig();

  const isThreadRoute = pathname.startsWith("/app/chat/") && params.threadId;

  if (!isMobile) return null;

  return (
    <div className="sticky top-0 z-30 flex h-11 min-h-11 items-center justify-between border-b border-border/50 bg-background px-2">
      <div className="flex min-w-0 items-center gap-2">
        {isThreadRoute ? (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/app/chat")}
            className="size-8"
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              className="size-4"
              strokeWidth={2}
            />
            <span className="sr-only">Back to chats</span>
          </Button>
        ) : (
          <SidebarTrigger className="size-8" />
        )}
        <h1 className="truncate text-base font-semibold leading-tight">
          {isThreadRoute ? thread?.title || "Chat" : "Chat"}
        </h1>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => router.push("/app/chat")}
        className="size-8"
      >
        <HugeiconsIcon
          icon={MessageQuestionIcon}
          className="size-4"
          strokeWidth={2}
        />
        <span className="sr-only">New chat</span>
      </Button>
    </div>
  );
}

function ChatLayoutContent({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const isMobile = useIsMobile();
  const isThreadRoute = params.threadId ? true : false;

  const transitionVariant = isThreadRoute && isMobile ? "slideInRight" : "fade";

  return (
    <>
      <ChatMobileHeader />
      <div className="flex h-full flex-1 flex-col overflow-hidden bg-background">
        <ChatPageTransition
          variant={transitionVariant}
          className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-background"
        >
          {children}
        </ChatPageTransition>
      </div>
    </>
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
