import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "@/lib/axiosClient";
import { useToast } from "@/hooks/use-toast";
import { clearTasksFromIndexedDB } from "@/lib/DexieDB";
import { useAuth } from "@clerk/nextjs";

const useTaskIncomplete = () => {
  const { getToken } = useAuth();

  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const token = await getToken();
      const response = await axiosClient.patch(
        `/api/tasks/incomplete/${id}`,
        {},
        {
          headers: { Authorization: token },
          withCredentials: true,
        }
      );
      return response.data.task[0];
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTask = queryClient.getQueryData(["tasks"]);

      queryClient.setQueryData(["tasks"], (old) =>
        updateTask(old, variables, { isCompleted: false, status: "todo" })
      );

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
      toast({ title: "Error marking task as incomplete", status: "error" });
      queryClient.setQueryData(["tasks"], context.previousTask);
      console.error("Error marking task as incomplete");
    },
  });
};

const updateTask = (old, id, data) => {
  return old?.map((task) =>
    task.id === id ? { ...task, ...data } : { ...task }
  );
};

export default useTaskIncomplete;
