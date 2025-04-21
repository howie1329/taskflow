import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getSocket } from "./socketClient";

export const useSocketClientListener = () => {
  const queryClient = useQueryClient();
  const socket = getSocket();
  useEffect(() => {
    if (!socket) {
      console.log("Returned");
      return;
    }

    console.log("Foundddde");
    const handleCreatedTask = () => {
      console.log("Task-Created Invalidate cache");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    };

    const handleRefresh = () => {
      console.log("WORKS");
    };

    socket.on("task-created", handleCreatedTask);
    socket.on("refresh", handleRefresh);

    return () => {
      socket.off("task-created", handleCreatedTask);
      socket.off("refresh", handleRefresh);
    };
  }, [socket, queryClient]);
};
