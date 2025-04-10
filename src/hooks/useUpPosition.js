"use client";

import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "@/lib/axiosClient";

const useChangePosition = (getToken) => {
  const token = getToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      try {
        const response = await axiosClient.patch(
          `/api/tasks/update/${id}`,
          data
        );
        return response.data.task[0];
      } catch (error) {
        console.error(error);
      }
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const previousTask = queryClient.getQueryData(["tasks"]);

      queryClient.setQueryData(["tasks"], (old) => updateTask(old, id, data));

      return { previousTask };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => {
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

export default useChangePosition;
