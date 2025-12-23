"use client";
import axiosClient from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const createSubtask = async (subtaskData, getToken) => {
  console.log("Subtask data: ", subtaskData);
  const token = await getToken();
  try {
    const response = await axiosClient.post(
      "/api/v1/subtasks/create",
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
      toast.error("Failed to create subtask");
      if (context?.previousSubtasks) {
        queryClient.setQueryData(
          ["subtasks", variables.taskId],
          context.previousSubtasks
        );
      }
    },
  });
};

export default useCreateSubtask;
