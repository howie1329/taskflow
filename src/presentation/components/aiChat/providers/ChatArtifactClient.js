"use client";
import { useChatMessageContext } from "./ChatMessageProvider";

export const ChatArtifactClient = () => {
  const { toolArtifacts } = useChatMessageContext();
  return (
    <div>
      <h1>Chat Artifacts</h1>
    </div>
  );
};
