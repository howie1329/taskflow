"use client";

import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import axiosClient from "@/lib/axiosClient";

const useSubtaskUpdateField = (getToken) => {
  const token = getToken();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, changedField, updateData, parent_id }) => {
      try {
        const data = { [changedField]: updateData };
        const response = await axiosClient.patch(
          `/api/subtasks/update/${id}`,
          data,
          {
            headers: { Authorization: token },
            withCredentials: true,
          }
        );
        return response.data.subtask[0];
      } catch (error) {
        console.error(error);
      }
    },
    onMutate: async ({ id, changedField, updateData, parent_id }) => {
      await queryClient.cancelQueries({ queryKey: ["subtasks", parent_id] });

      const previousTask = queryClient.getQueryData(["subtasks", parent_id]);
      const data = { [changedField]: updateData };

      queryClient.setQueryData(["subtasks", parent_id], (old) =>
        updateSubTask(old, id, data)
      );

      return { previousTask };
    },
    onSuccess: (variables) => {
      toast({ title: "Task updated successfully", status: "success" });
      queryClient.invalidateQueries({
        queryKey: ["subtasks", variables.parent_id],
      });
    },
    onError: (context, variables) => {
      queryClient.setQueryData(
        ["subtasks", variables.parent_id],
        context.previousTask
      );
      console.error("Error completing task");
    },
  });
};

const updateSubTask = (old, id, data) => {
  const updated = old?.map((task) =>
    task.subTask_id === id ? { ...task, ...data } : { ...task }
  );
  return updated;
};

export default useSubtaskUpdateField;
