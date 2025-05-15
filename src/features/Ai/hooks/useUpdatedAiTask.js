import { useToast } from "@/hooks/use-toast";
import axiosClient from "@/lib/axiosClient";
import { clearTasksFromIndexedDB } from "@/lib/DexieDB";
import { useQueryClient, useMutation } from "@tanstack/react-query";

const createAiTask = async ({ getToken, prompt, userId }) => {
  try {
    const token = await getToken();
    console.log("prompt", prompt);
    const response = await axiosClient.post(
      "/api/ai/generate-task",
      { prompt },
      {
        headers: {
          Authorization: token,
        },
        withCredentials: true,
      }
    );
    return response.data.task[0];
  } catch (error) {
    console.error(error);
  }
};

export const useCreateAiTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: createAiTask,
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const previousTask = queryClient.getQueryData(["tasks"]);

      //console.log("newTask", newTask);

      //queryClient.setQueryData(["tasks"], (old) => [...old, newTask]);

      return { previousTask };
    },
    onSuccess: async () => {
      toast({ title: "Task created successfully" });
      await clearTasksFromIndexedDB();
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (context) => {
      toast({ title: "Task creation failed" });
      queryClient.setQueryData(["tasks"], context.previousTask);
    },
  });
};
