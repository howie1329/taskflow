"use client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useChatMessageContext } from "./ChatMessageProvider";
import { ChatSingleArtifactClient } from "./ChatSingleArtifactClient";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { TextIndentMoreIcon } from "@hugeicons/core-free-icons/index";

export const ChatArtifactClient = () => {
  const { toolArtifacts } = useChatMessageContext();
  return (
    <Sheet>
      <SheetTrigger>
        <Button
          variant="outline"
          size="icon"
          className="hover:bg-foreground hover:text-white rounded-none hover:cursor-pointer"
        >
          <HugeiconsIcon icon={TextIndentMoreIcon} strokeWidth={2} />
        </Button>
      </SheetTrigger>
      <SheetContent className="!w-[90%] !max-w-[90%] lg:!w-[50%] lg:!max-w-[50%]">
        <div className="h-full w-full p-2 overflow-y-auto">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-sm font-semibold">Artifacts</h2>
            <span className="text-xs text-muted-foreground">
              {toolArtifacts?.length ?? 0}
            </span>
          </div>
          {toolArtifacts &&
            toolArtifacts.map((item) => (
              <ChatSingleArtifactClient key={item.id} artifact={item} />
            ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};
