"use client";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useDeleteTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id }) => {
      try {
        const response = await axios.delete(`/api/task/${id}`);
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
      toast({ title: "Task Deleted Successfully", status: "success" });
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
