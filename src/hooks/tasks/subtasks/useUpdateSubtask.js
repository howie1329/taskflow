"use client";
import { makeAuthenticatedRequest } from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const updateSubtask = async (subtaskId, subtaskData, getToken) => {
  const response = await makeAuthenticatedRequest(
    getToken,
    "patch",
    `/api/v1/subtasks/update/${subtaskId}`,
    subtaskData
  );
  return response.data.data;
};

const useUpdateSubtask = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ subtaskId, subtaskData, taskId }) =>
      updateSubtask(subtaskId, subtaskData, getToken),
    onMutate: async ({ subtaskId, subtaskData, taskId }) => {
      await queryClient.cancelQueries({ queryKey: ["subtasks", taskId] });
      const previousSubtasks = queryClient.getQueryData(["subtasks", taskId]);
      queryClient.setQueryData(["subtasks", taskId], (old) =>
        old.map((subtask) =>
          subtask.id === subtaskId ? { ...subtask, ...subtaskData } : subtask
        )
      );
      return { previousSubtasks };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["subtasks", variables.taskId],
      });
      toast.success("Subtask updated successfully");
    },
    onError: (error, variables, context) => {
      if (context?.previousSubtasks) {
        queryClient.setQueryData(
          ["subtasks", variables.taskId],
          context.previousSubtasks
        );
      }
      toast.error("Failed to update subtask", {
        description: error.message || "Failed to update subtask",
      });
    },
  });
};

export default useUpdateSubtask;
