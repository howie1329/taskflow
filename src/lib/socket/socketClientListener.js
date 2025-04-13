import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getSocket } from "./socketClient";

export const useSocketClientListener = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleCreatedTask = () => {
      console.log("Task-Created Invalidate cache");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    };

    socket.on("task-created", handleCreatedTask);

    return () => {
      socket.off("task-created", handleCreatedTask);
    };
  }, [queryClient]);
};
