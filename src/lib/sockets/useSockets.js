"use client";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";

export const useSockets = () => {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const newSocket = io(process.env.NEXT_PUBLIC_API_BASE_URL, {
      auth: {
        userId,
      },
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    // Task Listener
    newSocket.on("task-created", () => {
      queryClient.cancelQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    });
    newSocket.on("task-updated", () => {
      queryClient.cancelQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    });
    newSocket.on("task-deleted", () => {
      queryClient.cancelQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    });

    // Project Listener
    newSocket.on("project-created", () => {
      queryClient.cancelQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    });
    newSocket.on("project-updated", () => {
      queryClient.cancelQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    });
    newSocket.on("project-deleted", () => {
      queryClient.cancelQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    });

    // Note Listener
    newSocket.on("note-created", () => {
      queryClient.cancelQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    });
    newSocket.on("note-updated", (noteId) => {
      queryClient.cancelQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["note", noteId] });
    });
    newSocket.on("note-deleted", () => {
      queryClient.cancelQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [userId, queryClient]);

  return { socket, isConnected };
};
