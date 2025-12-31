"use client";
import { useEffect, useRef } from "react";
import { useSocket } from "@/lib/sockets/SocketProvider";

/**
 * Hook for handling AI chat streaming via Socket.io
 * @param {string} conversationId - The conversation ID to listen to
 * @param {Function} onStreamChunk - Callback when a stream chunk is received
 * @param {Function} onStreamStart - Callback when stream starts
 * @param {Function} onStreamFinish - Callback when stream finishes
 * @param {Function} onStreamError - Callback when stream error occurs
 */
export const useChatStream = ({
  conversationId,
  onStreamChunk,
  onStreamStart,
  onStreamFinish,
  onStreamError,
}) => {
  const { socket, isConnected } = useSocket();
  const joinedRoomRef = useRef(false);

  useEffect(() => {
    if (!socket || !isConnected || !conversationId) {
      return;
    }

    // Join conversation room
    if (!joinedRoomRef.current) {
      socket.emit("join-conversation", conversationId);
      joinedRoomRef.current = true;
      console.log(`Joined conversation room: ${conversationId}`);
    }

    // Listen for chat stream events
    const handleChatStream = (data) => {
      try {
        switch (data.type) {
          case "start":
            if (onStreamStart) {
              onStreamStart(data);
            }
            break;
          case "text-delta":
            if (onStreamChunk && data.textDelta) {
              onStreamChunk(data.textDelta);
            }
            break;
          case "finish":
            if (onStreamFinish) {
              onStreamFinish(data);
            }
            break;
          case "error":
            if (onStreamError) {
              onStreamError(data.error);
            }
            break;
          default:
            // Handle other event types (tool-call, tool-result, etc.)
            if (onStreamChunk) {
              onStreamChunk(data);
            }
        }
      } catch (error) {
        console.error("Error handling chat stream event:", error);
        if (onStreamError) {
          onStreamError(error);
        }
      }
    };

    socket.on("chat:stream", handleChatStream);

    // Cleanup
    return () => {
      socket.off("chat:stream", handleChatStream);
      if (joinedRoomRef.current) {
        socket.emit("leave-conversation", conversationId);
        joinedRoomRef.current = false;
        console.log(`Left conversation room: ${conversationId}`);
      }
    };
  }, [
    socket,
    isConnected,
    conversationId,
    onStreamChunk,
    onStreamStart,
    onStreamFinish,
    onStreamError,
  ]);

  return {
    isConnected,
    socket,
  };
};
