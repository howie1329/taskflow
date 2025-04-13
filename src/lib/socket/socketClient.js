import { io } from "socket.io-client";

let socket;

export const startSocket = (userId) => {
  if (!socket) {
    socket = io("http://localhost:3001", {
      auth: { userId },
      withCredentials: true,
    });
  }

  return socket;
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
