"use client";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }) => {
      try {
        const response = await axios.delete(`/api/todo/${id}`);
        return response.data;
      } catch (error) {
        console.error(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => {
      console.error("Error deleting task");
    },
  });
};

export default useDeleteTask;
