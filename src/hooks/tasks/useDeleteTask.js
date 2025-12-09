import { makeAuthenticatedRequest } from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const deleteTask = async (id, getToken) => {
  const response = await makeAuthenticatedRequest(
    getToken,
    "delete",
    `/api/v1/tasks/delete/${id}`
  );
  return response.data.message;
};

const useDeleteTask = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteTask(id, getToken),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData(["tasks"]);
      queryClient.setQueryData(["tasks"], (old) =>
        old.filter((task) => task.id !== id)
      );
      return { previousTasks };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted successfully");
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(["tasks"], context.previousTasks);
      toast.error("Task deletion failed", {
        description: error.message || "Failed to delete task",
      });
    },
  });
};

export default useDeleteTask;
