import { useEffect } from "react";
import { getSocket } from "./socketClient";

export const useSocketClient = () => {
  const socket = getSocket();
  useEffect(() => {
    const handleConnect = () => {
      console.log("User connected", socket?.userId);
    };

    const handleDisconnect = () => {
      console.log("User disconnect", socket?.userId);
    };

    if (socket) {
      socket.on("connect", handleConnect);

      socket.on("disconnect", handleDisconnect);
      return () => {
        socket.off("connect", handleConnect);
        socket.off("disconnect", handleDisconnect);
      };
    }
    return;
  }, [socket]);
};
