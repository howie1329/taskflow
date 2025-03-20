"use client";

import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useSubTaskIsComplete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data, parent_id }) => {
      try {
        const response = await axios.patch(`/api/subtask/${id}`, data);
        return response.data;
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["subtasks", data[0].task_id],
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
