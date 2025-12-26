"use client";
import { createContext, useContext, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { userId } = useAuth();
  const [socket, setSocket] = useState();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const socket = io(process.env.NEXT_PUBLIC_API_BASE_URL, {
      auth: { userId },
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      setSocket(socket);
      setIsConnected(true);
    });
    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setSocket(null);
      setIsConnected(false);
    });
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    });
    return () => {
      if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
      }
      setSocket(null);
      setIsConnected(false);
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
