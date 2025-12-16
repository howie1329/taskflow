import useDeleteConversation from "@/hooks/ai/useDeleteConversation";
import { useChatMessageContext } from "./ChatMessageProvider";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ConnectIcon,
  Delete03Icon,
  TaskEdit01Icon,
} from "@hugeicons/core-free-icons/index";
import { Separator } from "@/components/ui/separator";

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

  const handleDeleteConversation = () => {
    console.log("Deleting conversation for id: ", defaultConversationId);
    deleteConversation(defaultConversationId);
    router.push("/mainview/aichat");
  };

  const handleNewConversation = () => {
    router.push("/mainview/aichat");
  };
  return (
    <div className="flex flex-col gap-2 justify-between items-center w-full">
      <div className="flex flex-row justify-between items-center w-full">
        <h1>{conversation?.title}</h1>
        <div className="flex flex-row gap-2">
          <Button
            onClick={handleDeleteConversation}
            variant="outline"
            size="icon"
            className="hover:bg-foreground hover:text-white rounded-none hover:cursor-pointer"
          >
            <HugeiconsIcon icon={Delete03Icon} strokeWidth={2} />
          </Button>
          <Button
            onClick={handleNewConversation}
            variant="outline"
            size="icon"
            className="hover:bg-foreground hover:text-white rounded-none hover:cursor-pointer"
          >
            <HugeiconsIcon icon={TaskEdit01Icon} strokeWidth={2} />
          </Button>
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
