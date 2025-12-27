import axiosClient from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const completeTask = async (id, getToken) => {
  const token = await getToken();
  const response = await axiosClient.patch(`/api/v1/tasks/complete/${id}`, {
    headers: { Authorization: token },
    withCredentials: true,
  });
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
    onError: (context) => {
      queryClient.setQueryData(["tasks"], context.previousTasks);
      toast.error("Task Completion Failed");
    },
  });
};

export default useCompleteTask;
