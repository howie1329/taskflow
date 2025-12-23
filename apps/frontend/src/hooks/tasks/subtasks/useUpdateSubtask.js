"use client";
import axiosClient from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const updateSubtask = async (subtaskId, subtaskData, getToken) => {
  const token = await getToken();
  try {
    const response = await axiosClient.patch(
      `/api/v1/subtasks/update/${subtaskId}`,
      subtaskData,
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
      toast.error("Failed to update subtask");
      if (context?.previousSubtasks) {
        queryClient.setQueryData(
          ["subtasks", variables.taskId],
          context.previousSubtasks
        );
      }
    },
  });
};

export default useUpdateSubtask;
