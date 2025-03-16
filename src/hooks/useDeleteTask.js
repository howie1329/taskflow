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
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const previousTask = queryClient.getQueryData(["tasks"]);

      queryClient.setQueryData(["tasks"], (old) => updateTask(old, id));

      return { previousTask };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (context) => {
      queryClient.setQueryData(["tasks"], context.previousTask);
      console.error("Error deleting task");
    },
  });
};

const updateTask = (old, id) => {
  return old?.filter((task) => task.id != id);
};

export default useDeleteTask;
