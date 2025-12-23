"use client";
import { useChatMessageContext } from "./ChatMessageProvider";

export const ChatSingleArtifactClient = () => {
  const { toolArtifacts } = useChatMessageContext();
  return (
    <div>
      <h1>Chat Single Artifact</h1>
    </div>
  );
};
