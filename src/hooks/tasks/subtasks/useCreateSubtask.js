"use client";
import { makeAuthenticatedRequest } from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const createSubtask = async (subtaskData, getToken) => {
  const response = await makeAuthenticatedRequest(
    getToken,
    "post",
    "/api/v1/subtasks/create",
    subtaskData
  );
  return response.data.data;
};

const useCreateSubtask = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subtaskData) => createSubtask(subtaskData, getToken),
    onMutate: async ({ taskId }) => {
      await queryClient.cancelQueries({ queryKey: ["subtasks", taskId] });
      const previousSubtasks = queryClient.getQueryData(["subtasks", taskId]);
      return { previousSubtasks };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["subtasks", variables.taskId],
      });
      toast.success("Subtask created successfully");
    },
    onError: (error, variables, context) => {
      if (context?.previousSubtasks) {
        queryClient.setQueryData(
          ["subtasks", variables.taskId],
          context.previousSubtasks
        );
      }
      toast.error("Failed to create subtask", {
        description: error.message || "Failed to create subtask",
      });
    },
  });
};

export default useCreateSubtask;
