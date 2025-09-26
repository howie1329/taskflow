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
    // IMPORTANT: Check to see how many http requests are being made to the server as we still use tanstack query to fetch data
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
      queryClient.cancelQueries({ queryKey: ["note", noteId] });
      queryClient.invalidateQueries({ queryKey: ["note", noteId] });
    });
    newSocket.on("note-deleted", () => {
      queryClient.cancelQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    });

    // Notification Listener
    newSocket.on("notification-created", () => {
      queryClient.cancelQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });

    newSocket.on("notifications-clean-up", () => {
      queryClient.cancelQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [userId, queryClient]);

  return { socket, isConnected };
};
