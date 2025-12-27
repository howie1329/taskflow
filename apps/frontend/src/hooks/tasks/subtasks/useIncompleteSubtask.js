import axiosClient from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const incompleteSubtask = async (id, taskId, getToken) => {
  const token = await getToken();
  const response = await axiosClient.patch(
    `/api/v1/subtasks/incomplete/${id}`,
    {
      headers: { Authorization: token },
      withCredentials: true,
    }
  );
  return response.data.data;
};

const useIncompleteSubtask = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, taskId }) => incompleteSubtask(id, taskId, getToken),
    onMutate: async ({ id, taskId }) => {
      await queryClient.cancelQueries({ queryKey: ["subtasks", taskId] });
      const previousSubtasks = queryClient.getQueryData(["subtasks", taskId]);
      queryClient.setQueryData(["subtasks", taskId], (old) =>
        old.map((subtask) =>
          subtask.id === id ? { ...subtask, isCompleted: false } : subtask
        )
      );
      return { previousSubtasks };
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ["subtasks", variables.taskId],
      });
      toast.success("Subtask incomplete successfully");
    },
    onError: (error, variables, context) => {
      toast.error("Failed to incomplete subtask");
      queryClient.setQueryData(
        ["subtasks", variables.taskId],
        context.previousSubtasks
      );
    },
  });
};

export default useIncompleteSubtask;
