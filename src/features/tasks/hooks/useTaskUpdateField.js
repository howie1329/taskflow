"use client";

import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../../hooks/use-toast";
import { clearTasksFromIndexedDB } from "@/lib/DexieDB";
import axiosClient from "@/lib/axiosClient";

const useTaskUpdateField = (getToken) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, changedField, updateData }) => {
      const token = await getToken();
      try {
        const data = { [changedField]: updateData };
        const response = await axiosClient.patch(
          `/api/tasks/update/${id}`,
          data,
          {
            headers: { Authorization: token },
            withCredentials: true,
          }
        );
        return response.data.task[0];
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
    onSuccess: async () => {
      toast({ title: "Task updated successfully", status: "success" });
      await clearTasksFromIndexedDB();
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
