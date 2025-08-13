import { useEffect } from "react";
import { io } from "socket.io-client";

let socket = null;

export const startSocket = (userId) => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_BASE_URL, {
      auth: { userId },
      extraHeaders: { userid: userId },
      withCredentials: true,
    });
  }
  return socket;
};

export const useStart = (userId) => {
  useEffect(() => {
    if (userId) {
      startSocket(userId);
    }
  }, [userId]);
};

export const getSocket = () => {
  if (!socket) {
    console.log("No socket");
    return null;
  }
  if (socket) {
    console.log("Found Socket");
    return socket;
  }
};
