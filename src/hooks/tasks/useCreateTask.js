"use client";
import { makeAuthenticatedRequest } from "@/lib/axios/axiosClient";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const createTask = async (task, getToken) => {
  const response = await makeAuthenticatedRequest(
    getToken,
    "post",
    "/api/v1/tasks/create",
    task
  );
  return response.data.data;
};

const useCreateTask = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (task) => createTask(task, getToken),
    onMutate: async (task) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData(["tasks"]);
      queryClient.setQueryData(["tasks"], (old) => [...old, task]);
      return { previousTasks };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created successfully", {
        description: new Date().toLocaleString(),
      });
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(["tasks"], context.previousTasks);
      toast.error("Task creation failed", {
        description: error.message || "Failed to create task",
      });
    },
  });
};

export default useCreateTask;
