import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import uploadSubtask from "./useUploadSubTask";
import { uploadNote } from "./useUploadNote";

const uploadAITask = async (data) => {
  try {
    let subTasks = null;
    let note = null;
    const aiResponse = await axios.post("/api/ai", data);
    if (aiResponse.data.subTasks) {
      subTasks = aiResponse.data.subTasks;
      delete aiResponse.data.subTasks;
    }
    if (aiResponse.data.notes) {
      note = aiResponse.data.notes;
      delete aiResponse.data.notes;
    }
    console.log("ai DAta:", aiResponse.data);
    const response = await axios.post("/api/task", aiResponse.data);
    if (subTasks) {
      subTasks.forEach(async (subTask) => {
        subTask["task_id"] = response.data[0].id;
        if (subTask.subTask_name == null) return;
        await uploadSubtask(subTask);
      });
    }
    if (note) {
      note["task_id"] = response.data[0].id;
      await uploadNote(note);
    }
    return aiResponse;
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
    onSuccess: () => {
      toast({ title: "Task Uploaded Successfully", status: "success" });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

export default useUploadAITask;
