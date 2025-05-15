"use client";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../../hooks/use-toast";
import { clearTasksFromIndexedDB } from "@/lib/DexieDB";
import axiosClient from "@/lib/axiosClient";

const useDeleteTask = (getToken) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id }) => {
      const token = await getToken();
      try {
        const response = await axiosClient.delete(`/api/tasks/delete/${id}`, {
          headers: { Authorization: token },
          withCredentials: true,
        });
        return response.data.message;
      } catch (error) {
        console.error(error);
      }
    },
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const previousTask = queryClient.getQueryData(["tasks"]);

      queryClient.setQueryData(["tasks"], (old) => updateTask(old, id));

      return { previousTask };
    },
    onSuccess: async () => {
      toast({ title: "Task Deleted Successfully", status: "success" });
      await clearTasksFromIndexedDB();
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (context) => {
      queryClient.setQueryData(["tasks"], context.previousTask);
      console.error("Error deleting task");
    },
  });
};

const updateTask = (old, id) => {
  return old?.filter((task) => task.id != id);
};

export default useDeleteTask;
