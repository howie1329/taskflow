"use client";
import { useChatMessageContext } from "./ChatMessageProvider";
import { ChatSingleArtifactClient } from "./ChatSingleArtifactClient";

export const ChatArtifactClient = () => {
  const { toolArtifacts } = useChatMessageContext();
  return (
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
  );
};
