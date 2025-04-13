import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export const useSocketClientListener = (socket) => {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!socket) return;

    const handleCreatedTask = () => {
      console.log("Task-Created Invalidate cache");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    };

    socket.on("task-created", handleCreatedTask);

    return () => {
      socket.off("task-created", handleCreatedTask);
    };
  }, [socket, queryClient]);
};
