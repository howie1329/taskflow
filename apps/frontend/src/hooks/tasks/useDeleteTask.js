import axiosClient from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const deleteTask = async (id, getToken) => {
  const token = await getToken();
  const response = await axiosClient.delete(`/api/v1/tasks/delete/${id}`, {
    headers: {
      Authorization: token,
    },
    withCredentials: true,
  });
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
    onError: (context) => {
      queryClient.setQueryData(["tasks"], context.previousTasks);
      toast.error("Task deletion failed");
    },
  });
};

export default useDeleteTask;
