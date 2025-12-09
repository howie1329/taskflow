"use client";
import { makeAuthenticatedRequest } from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const updateTask = async (taskId, taskData, getToken) => {
  const response = await makeAuthenticatedRequest(
    getToken,
    "patch",
    `/api/v1/tasks/update/${taskId}`,
    taskData
  );
  return response.data.data;
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
