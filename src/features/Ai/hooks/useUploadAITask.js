import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clearTasksFromIndexedDB } from "@/lib/DexieDB";
import { uploadNote } from "@/features/notes/hooks/useUploadNote";
import uploadSubtask from "@/features/subtasks/hooks/useUploadSubTask";
import { useToast } from "@/hooks/use-toast";
import axiosClient from "@/lib/axiosClient";

const uploadAITask = async (data) => {
  try {
    const token = await data.token;
    const userId = await data.userId;
    let subTasks = null;
    let note = null;
    console.log("Data:", data.prompt);
    const AiResponse = await axiosClient.post(
      "/api/ai/generate-task",
      { prompt: data.prompt },
      {
        headers: { Authorization: token },
        withCredentials: true,
      }
    );
    console.log("AiResponse:", AiResponse.data);
    if (AiResponse.data.subTasks) {
      subTasks = AiResponse.data.subTasks;
      delete AiResponse.data.subTasks;
    }
    if (AiResponse.data.notes) {
      note = AiResponse.data.notes;
      delete AiResponse.data.notes;
    }
    AiResponse.data["userId"] = userId;
    console.log("ai Data:", AiResponse.data);
    const response = await axiosClient.post(
      "/api/tasks/create",
      AiResponse.data,
      {
        headers: { Authorization: token },
        withCredentials: true,
      }
    );
    console.log("Subtask Array:", subTasks);
    console.log("Response:", response.data.task[0]);
    if (subTasks) {
      subTasks.forEach(async (subTask) => {
        subTask["task_id"] = response.data.task[0].id;
        if (subTask.subTask_name == null) return;
        await uploadSubtask(subTask);
      });
    }
    if (note) {
      note["task_id"] = response.data.task[0].id;
      await uploadNote(note);
    }
    return AiResponse;
  } catch (error) {
    console.error(error);
  }
};

const useUploadAITask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: uploadAITask,
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const previousTask = queryClient.getQueryData(["tasks"]);

      console.log(newTask);

      queryClient.setQueryData(["tasks"], (old) => [...old, newTask]);

      return { previousTask };
    },
    onError: (context) => {
      toast({ title: "Task Upload Failed", status: "error" });
      queryClient.setQueryData(["tasks"], context.previousTask);
    },
    onSuccess: async () => {
      toast({ title: "Task Uploaded Successfully", status: "success" });
      await clearTasksFromIndexedDB();
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

export default useUploadAITask;
