"use client";

import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../../hooks/use-toast";
import axiosClient from "@/lib/axiosClient";

const useSubTaskIsComplete = (getToken) => {
  const token = getToken();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data, parent_id }) => {
      try {
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
    onMutate: async ({ id, data, parent_id }) => {
      await queryClient.cancelQueries({ queryKey: ["subtasks", parent_id] });

      const previousSubTask = queryClient.getQueryData(["subtasks", parent_id]);

      queryClient.setQueryData(["subtasks", parent_id], (old) =>
        currentSubTask(old, id, data)
      );

      return { previousSubTask };
    },
    onSuccess: (variables) => {
      toast({
        title: "Subtask Status Changed Successfully",
        status: "success",
      });
      queryClient.invalidateQueries({
        queryKey: ["subtasks", variables.parent_id],
      });
    },
    onError: () => {
      console.error("Error completing task");
    },
  });
};

const currentSubTask = (old, id, data) => {
  const updated = old?.map((subtask) =>
    subtask.subTask_id === id ? { ...subtask, ...data } : { ...subtask }
  );
  return updated;
};

export default useSubTaskIsComplete;
