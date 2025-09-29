"use client";
import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import useSocketStore from "./SocketStore";

const useSocketConnection = () => {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const initializeSocket = useSocketStore((state) => state.initializeSocket);
  const disconnectSocket = useSocketStore((state) => state.disconnectSocket);
  const socket = useSocketStore((state) => state.socket);
  const isConnected = useSocketStore((state) => state.isConnected);

  useEffect(() => {
    if (!userId) return;
    initializeSocket({ userId, queryClient });
    return () => disconnectSocket();
  }, [userId, queryClient, initializeSocket, disconnectSocket]);

  return { socket, isConnected };
};

export default useSocketConnection;
