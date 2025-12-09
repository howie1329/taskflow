import { makeAuthenticatedRequest } from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const incompleteTask = async (id, getToken) => {
  const response = await makeAuthenticatedRequest(
    getToken,
    "patch",
    `/api/v1/tasks/incomplete/${id}`
  );
  return response.data.data;
};

const useIncompleteTask = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => incompleteTask(id, getToken),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData(["tasks"]);
      queryClient.setQueryData(["tasks"], (old) =>
        old.map((task) =>
          task.id === id
            ? { ...task, isCompleted: false, status: "todo" }
            : task
        )
      );
      return { previousTasks };
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["subtasks", variables] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task Incompleted Successfully");
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(["tasks"], context.previousTasks);
      toast.error("Task Incompletion Failed", {
        description: error.message || "Failed to incomplete task",
      });
    },
  });
};

export default useIncompleteTask;
