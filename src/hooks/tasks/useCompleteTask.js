import { makeAuthenticatedRequest } from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const completeTask = async (id, getToken) => {
  const response = await makeAuthenticatedRequest(
    getToken,
    "patch",
    `/api/v1/tasks/complete/${id}`
  );
  return response.data.data;
};

const useCompleteTask = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => completeTask(id, getToken),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData(["tasks"]);
      queryClient.setQueryData(["tasks"], (old) =>
        old.map((task) =>
          task.id === id ? { ...task, isCompleted: true, status: "done" } : task
        )
      );
      return { previousTasks };
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["subtasks", variables] });
      toast.success("Task Completed Successfully");
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(["tasks"], context.previousTasks);
      toast.error("Task Completion Failed", {
        description: error.message || "Failed to complete task",
      });
    },
  });
};

export default useCompleteTask;
