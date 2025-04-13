import { useEffect } from "react";
import { socket } from "./socketClient";

export const useSocketClient = () => {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("User connected");
    });

    socket.on("disconnect", () => {
      console.log("User disconnect");
    });
    return () => {
      socket.disconnect();
    };
  }, []);
};
