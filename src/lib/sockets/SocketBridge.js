"use client";
import { useAuth } from "@clerk/nextjs";
import { useSockets } from "./useSockets";
import { useEffect } from "react";

export const SocketBridge = () => {
  const { socket, isConnected } = useSockets();
  const { userId } = useAuth();
  useEffect(() => {
    if (isConnected) {
      // This is deprecated
      socket.emit("join", { userId: userId });
    }
  }, [isConnected, socket, userId]);
  return null; // This is a bridge to the socket
};
