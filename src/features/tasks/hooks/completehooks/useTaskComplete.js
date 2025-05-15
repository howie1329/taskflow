import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "@/lib/axiosClient";
import { useToast } from "@/hooks/use-toast";
import { clearTasksFromIndexedDB } from "@/lib/DexieDB";
import { useAuth } from "@clerk/nextjs";

const useTaskComplete = () => {
  const { getToken } = useAuth();
  const token = getToken();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      console.log("User", token);
      try {
        const response = await axiosClient.patch(
          `/api/tasks/complete/${id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        return response.data.task[0];
      } catch (error) {
        console.error("Full error:", error);
        console.error("Request config:", {
          url: error.config?.url,
          headers: error.config?.headers,
          method: error.config?.method,
        });
        console.error(error);
      }
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const previousTask = queryClient.getQueryData(["tasks"]);

      queryClient.setQueryData(["tasks"], (old) =>
        updateTask(old, variables, { isCompleted: true, status: "done" })
      );

      return { previousTask };
    },
    onSuccess: async (context) => {
      toast({ title: "Task Status Changed Successfully", status: "success" });

      await clearTasksFromIndexedDB();

      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
      queryClient.invalidateQueries({
        queryKey: ["subtasks", context.id],
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

export default useTaskComplete;
