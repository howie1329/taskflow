"use client";
import axiosClient from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const updateTask = async (taskId, taskData, getToken) => {
  const token = await getToken();
  try {
    const response = await axiosClient.patch(
      `/api/v1/tasks/update/${taskId}`,
      taskData,
      {
        headers: {
          Authorization: token,
        },
        withCredentials: true,
      }
    );
    return response.data.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const useUpdateTask = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, taskData }) =>
      updateTask(taskId, taskData, getToken),
    onMutate: async ({ taskId, taskData }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData(["tasks"]);
      queryClient.setQueryData(["tasks"], (old) =>
        old.map((task) =>
          task.id === taskId ? { ...task, ...taskData } : task
        )
      );
      return { previousTasks };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({
        queryKey: ["subtasks", variables.taskId],
      });
      toast.success("Task updated successfully");
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(["tasks"], context.previousTasks);
      toast.error("Task update failed", {
        description: error.message || "Failed to update task",
      });
    },
  });
};

export default useUpdateTask;
