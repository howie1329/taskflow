"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../../hooks/use-toast";
import { clearTasksFromIndexedDB, updateTaskToIndexDB } from "@/lib/DexieDB";
import axiosClient from "@/lib/axiosClient";

const useIsComplete = (getToken) => {
  const token = getToken();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      try {
        const response = await axiosClient.patch(
          `/api/tasks/update/${id}`,
          data,
          {
            headers: { Authorization: token },
            withCredentials: true,
          }
        );
        return response.data.task[0];
      } catch (error) {
        console.error(error);
      }
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const previousTask = queryClient.getQueryData(["tasks"]);

      queryClient.setQueryData(["tasks"], (old) => updateTask(old, id, data));

      return { previousTask };
    },
    onSuccess: async (context) => {
      toast({ title: "Task Status Changed Successfully", status: "success" });

      await clearTasksFromIndexedDB();

      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
    onError: (context) => {
      toast({ title: "Error completing task", status: "error" });
      queryClient.setQueryData(["tasks"], context.previousTask);
      console.error("Error completing task");
    },
  });
};

const updateTask = (old, id, data) => {
  return old?.map((task) =>
    task.id === id ? { ...task, ...data } : { ...task }
  );
};

export default useIsComplete;
