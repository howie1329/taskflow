import { makeAuthenticatedRequest } from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const completeSubtask = async (id, taskId, getToken) => {
  const response = await makeAuthenticatedRequest(
    getToken,
    "patch",
    `/api/v1/subtasks/complete/${id}`
  );
  return response.data.data;
};

const useCompleteSubtask = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, taskId }) => completeSubtask(id, taskId, getToken),
    onMutate: async ({ id, taskId }) => {
      await queryClient.cancelQueries({ queryKey: ["subtasks", taskId] });
      const previousSubtasks = queryClient.getQueryData(["subtasks", taskId]);
      queryClient.setQueryData(["subtasks", taskId], (old) =>
        old.map((subtask) =>
          subtask.id === id ? { ...subtask, isCompleted: true } : subtask
        )
      );
      return { previousSubtasks };
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ["subtasks", variables.taskId],
      });
      toast.success("Subtask completed successfully");
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(
        ["subtasks", variables.taskId],
        context.previousSubtasks
      );
      toast.error("Failed to complete subtask", {
        description: error.message || "Failed to complete subtask",
      });
    },
  });
};

export default useCompleteSubtask;
