"use client";

import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useTaskUpdateField = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, changedField, updateData }) => {
      try {
        const data = { [changedField]: updateData };
        const response = await axios.patch(`/api/task/${id}`, data);
        return response.data;
      } catch (error) {
        console.error(error);
      }
    },
    onMutate: async ({ id, changedField, updateData }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const previousTask = queryClient.getQueryData(["tasks"]);
      const data = { [changedField]: updateData };

      queryClient.setQueryData(["tasks"], (old) => updateTask(old, id, data));

      return { previousTask };
    },
    onSuccess: () => {
      toast({ title: "Task updated successfully", status: "success" });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (context) => {
      queryClient.setQueryData(["tasks"], context.previousTask);
      console.error("Error completing task");
    },
  });
};

const updateTask = (old, id, data) => {
  const updated = old?.map((task) =>
    task.id === id ? { ...task, ...data } : { ...task }
  );
  return updated;
};

export default useTaskUpdateField;
