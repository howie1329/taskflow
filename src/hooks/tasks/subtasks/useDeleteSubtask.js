"use client";
import { makeAuthenticatedRequest } from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const deleteSubtask = async (subtaskId, getToken) => {
  const response = await makeAuthenticatedRequest(
    getToken,
    "delete",
    `/api/v1/subtasks/delete/${subtaskId}`
  );
  return response.data.data;
};

const useDeleteSubtask = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ subtaskId, taskId }) => deleteSubtask(subtaskId, getToken),
    onMutate: async ({ subtaskId, taskId }) => {
      await queryClient.cancelQueries({ queryKey: ["subtasks", taskId] });
      const previousSubtasks = queryClient.getQueryData(["subtasks", taskId]);
      queryClient.setQueryData(["subtasks", taskId], (old) =>
        old.filter((subtask) => subtask.id !== subtaskId)
      );
      return { previousSubtasks };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["subtasks", variables.taskId],
      });
      toast.success("Subtask deleted successfully");
    },
    onError: (error, variables, context) => {
      if (context?.previousSubtasks) {
        queryClient.setQueryData(
          ["subtasks", variables.taskId],
          context.previousSubtasks
        );
      }
      toast.error("Failed to delete subtask", {
        description: error.message || "Failed to delete subtask",
      });
    },
  });
};

export default useDeleteSubtask;
