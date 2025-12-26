import useDeleteConversation from "@/hooks/ai/useDeleteConversation";
import { useChatMessageContext } from "./ChatMessageProvider";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ConnectIcon,
  Delete03Icon,
  EllipseSelectionIcon,
  TaskEdit01Icon,
} from "@hugeicons/core-free-icons/index";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";
import { useSocket } from "@/lib/sockets/SocketProvider";
export const ChatHeaderClient = () => {
  const {
    conversation,
    defaultConversationId,
    toolArtifacts,
    isToolArtifactsOpen,
    setIsToolArtifactsOpen,
  } = useChatMessageContext();
  const { mutate: deleteConversation } = useDeleteConversation();
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const [title, setTitle] = useState(conversation?.title || "");
  const handleDeleteConversation = () => {
    console.log("Deleting conversation for id: ", defaultConversationId);
    deleteConversation(defaultConversationId);
    router.push("/mainview/aichat");
  };

  const handleNewConversation = () => {
    router.push("/mainview/aichat");
  };

  useEffect(() => {
    if (socket && isConnected) {
      console.log("Listening for conversation title updates");
      socket.on("conversation-title-updated", (data) => {
        const { conversationId, title } = data;
        if (conversationId === defaultConversationId) {
          setTitle(title);
          console.log("Conversation title updated:", title);
        }
      });
    }
  }, [socket, isConnected, defaultConversationId]);
  return (
    <div className="flex flex-col gap-2 justify-between items-center w-full">
      <div className="flex flex-row justify-between items-center w-full">
        <SidebarTrigger className="lg:hidden" />
        <h1 className="text-lg font-bold text-ellipsis line-clamp-1">
          {title}
        </h1>
        <div className="flex flex-row gap-2">
          <ChatHeaderOptionsPopover
            handleDeleteConversation={handleDeleteConversation}
            handleNewConversation={handleNewConversation}
          />

          {/* Will be used to show tool artifacts in a sheet*/}
          {toolArtifacts.length > 0 && (
            <Button
              variant="outline"
              size="icon"
              className="hover:bg-foreground hover:text-white rounded-none hover:cursor-pointer"
              onClick={() => setIsToolArtifactsOpen(!isToolArtifactsOpen)}
            >
              <HugeiconsIcon icon={ConnectIcon} strokeWidth={2} />
            </Button>
          )}
        </div>
      </div>
      <Separator />
    </div>
  );
};

const ChatHeaderOptionsPopover = ({
  handleDeleteConversation,
  handleNewConversation,
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-none">
          <HugeiconsIcon icon={EllipseSelectionIcon} strokeWidth={2} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="left"
        sideOffset={10}
        className="flex flex-col rounded-none gap-2 p-2 w-fit"
      >
        <Button
          onClick={handleNewConversation}
          variant="outline"
          size="sm"
          className="flex items-center justify-start text-xs hover:bg-foreground hover:text-white rounded-none hover:cursor-pointer"
        >
          <HugeiconsIcon icon={TaskEdit01Icon} strokeWidth={2} />
          New Conversation
        </Button>
        <Button
          onClick={handleDeleteConversation}
          size="sm"
          variant="outline"
          className="flex items-center justify-start text-xs hover:bg-foreground hover:text-white rounded-none hover:cursor-pointer"
        >
          <HugeiconsIcon icon={Delete03Icon} strokeWidth={2} />
          Delete
        </Button>
      </PopoverContent>
    </Popover>
  );
};
