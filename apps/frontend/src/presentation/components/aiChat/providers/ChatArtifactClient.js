"use client";
import { useChatMessageContext } from "./ChatMessageProvider";
import { ChatSingleArtifactClient } from "./ChatSingleArtifactClient";

export const ChatArtifactClient = () => {
  const { toolArtifacts } = useChatMessageContext();
  console.log("Tool Artifacts", toolArtifacts);
  return (
    <div>
      <h1>Chat Artifacts</h1>
      {toolArtifacts &&
        toolArtifacts.map((item) => (
          <ChatSingleArtifactClient key={item.id} artifact={item} />
        ))}
    </div>
  );
};
