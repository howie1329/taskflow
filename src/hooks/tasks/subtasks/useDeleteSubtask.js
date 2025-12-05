"use client";
import axiosClient from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const deleteSubtask = async (subtaskId, getToken) => {
  const token = await getToken();
  try {
    const response = await axiosClient.delete(
      `/api/v1/subtasks/delete/${subtaskId}`,
      {
        headers: { Authorization: token },
        withCredentials: true,
      }
    );
    return response.data.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
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
      toast.error("Failed to delete subtask");
      if (context?.previousSubtasks) {
        queryClient.setQueryData(
          ["subtasks", variables.taskId],
          context.previousSubtasks
        );
      }
    },
  });
};

export default useDeleteSubtask;
