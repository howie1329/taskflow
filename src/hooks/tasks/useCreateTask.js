"use client";
import axiosClient from "@/lib/axios/axiosClient";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const createTask = async (task, getToken) => {
  const token = await getToken();
  try {
    const response = await axiosClient.post("/api/tasks/create", task, {
      headers: {
        Authorization: token,
      },
      withCredentials: true,
    });
    return response.data.data;
  } catch (error) {
    console.error(error);
    toast.error("Task creation failed", {
      description: `${error.message} - ${new Date().toLocaleString()}`,
    });
  }
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
    onError: (context) => {
      toast.error("Task creation failed", {
        description: `${
          context.error.message
        } - ${new Date().toLocaleString()}`,
      });
      queryClient.setQueryData(["tasks"], context.previousTasks);
    },
  });
};

export default useCreateTask;
